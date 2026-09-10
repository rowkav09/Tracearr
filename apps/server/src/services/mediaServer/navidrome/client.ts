import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { IMediaServerClient, MediaServerConfig, MediaSession, MediaLibraryItem } from '../types.js';

const credentials = z.object({ username: z.string().min(1), password: z.string().min(1) });
const song = z.object({
  id: z.string(), title: z.string(), duration: z.number().nonnegative().default(0),
  artist: z.string().optional(), album: z.string().optional(), albumId: z.string().optional(),
  artistId: z.string().optional(), track: z.number().optional(), discNumber: z.number().optional(),
  year: z.number().optional(), bitRate: z.number().optional(), suffix: z.string().optional(),
  channelCount: z.number().optional(), coverArt: z.string().optional(), created: z.string().optional(),
});
const playing = song.extend({ username: z.string().min(1), playerName: z.string().optional(),
  state: z.string(), positionMs: z.number().nonnegative(), playbackRate: z.number().optional() });

/** Navidrome 0.63.2: playerId is a response index, never a device identifier.
 * Identical concurrent user/client pairs cannot be disambiguated; fail closed.
 * History is created by Tracearr's ordinary polling lifecycle, never by DB writes.
 */
export function parseNowPlaying(value: unknown): MediaSession[] {
  const entries = z.array(playing).parse(value ?? []);
  const keys = entries.map(e => JSON.stringify([e.username, e.playerName ?? 'Unknown client']));
  return entries.flatMap((e, i) => {
    if (keys.indexOf(keys[i]!) !== keys.lastIndexOf(keys[i]!) || !['playing', 'paused'].includes(e.state)) return [];
    const durationMs = Math.round(e.duration * 1000);
    const positionMs = Math.min(durationMs, Math.round(e.positionMs));
    const deviceId = createHash('sha256').update(keys[i]!).digest('hex');
    return [{
      sessionKey: deviceId, mediaId: e.id,
      user: { id: e.username, username: e.username },
      media: { title: e.title, type: 'track' as const, durationMs, year: e.year },
      music: { artistName: e.artist, albumName: e.album, trackNumber: e.track, discNumber: e.discNumber },
      playback: { state: e.state as 'playing' | 'paused', positionMs, progressPercent: durationMs ? positionMs / durationMs * 100 : 0 },
      player: { name: e.playerName ?? 'Unknown client', product: e.playerName, deviceId },
      // OpenSubsonic does not expose the listener's network address or delivered stream codec.
      network: { ipAddress: '', isLocal: false },
      quality: { bitrate: 0, isTranscode: false, videoDecision: 'unknown', audioDecision: 'unknown',
        sourceAudioCodec: e.suffix, sourceAudioChannels: e.channelCount,
        sourceAudioDetails: { bitrate: e.bitRate } },
    }];
  });
}

export class NavidromeClient implements IMediaServerClient {
  readonly serverType = 'navidrome' as const;
  private readonly auth;
  private readonly baseUrl: string;
  constructor(config: MediaServerConfig) {
    if (process.env.ATHENAEUM_NAVIDROME_ENABLED !== 'true') throw new Error('Navidrome integration is disabled');
    try { this.auth = credentials.parse(JSON.parse(config.token)); }
    catch { throw new Error('Navidrome credentials must contain username and password'); }
    this.baseUrl = config.url.replace(/\/+$/, '');
  }
  private async request(endpoint: string, extra: Record<string, string> = {}): Promise<Record<string, unknown>> {
    const salt = randomBytes(16).toString('hex');
    const params = new URLSearchParams({ u: this.auth.username,
      t: createHash('md5').update(this.auth.password + salt).digest('hex'), s: salt,
      v: '1.16.1', c: 'Tracearr-Athenaeum', f: 'json', ...extra });
    // Never include credential-bearing URLs or upstream bodies in errors/logs.
    let response: Response;
    try { response = await fetch(`${this.baseUrl}/rest/${endpoint}.view`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params, redirect: 'error', signal: AbortSignal.timeout(10000),
    }); } catch { throw new Error(`Navidrome ${endpoint} connection failed`); }
    if (!response.ok) throw new Error(`Navidrome ${endpoint} HTTP ${response.status}`);
    const envelope = z.object({ 'subsonic-response': z.object({ status: z.literal('ok') }).passthrough() }).safeParse(await response.json());
    if (!envelope.success) throw new Error(`Navidrome ${endpoint} rejected the request`);
    return envelope.data['subsonic-response'];
  }
  async testConnection() { await this.request('ping'); await this.getUsers(); return true; }
  async getSoftwareVersion() { const r = await this.request('ping'); return typeof r.serverVersion === 'string' ? r.serverVersion : null; }
  async getSessions() {
    const r = await this.request('getNowPlaying');
    // OpenSubsonic uses `nowPlayingList`; accept the legacy shorthand used by
    // a few Navidrome-compatible servers as well.
    const body = z.object({ entry: z.unknown().optional() }).parse(r.nowPlayingList ?? r.nowPlaying);
    return parseNowPlaying(body.entry);
  }
  async getUsers() {
    const r = await this.request('getUsers');
    const body = z.object({ user: z.array(z.object({ username: z.string(), adminRole: z.boolean().optional() })).default([]) }).parse(r.users);
    return body.user.map(u => ({ id: u.username, username: u.username, isAdmin: u.adminRole === true }));
  }
  async getLibraries() {
    const r = await this.request('getMusicFolders');
    const body = z.object({ musicFolder: z.array(z.object({ id: z.union([z.string(), z.number()]), name: z.string() })).default([]) }).parse(r.musicFolders);
    return body.musicFolder.map(f => ({ id: String(f.id), name: f.name, type: 'music' }));
  }
  async getLibraryItems(libraryId: string, options?: { offset?: number; limit?: number }) {
    const offset = options?.offset ?? 0; const limit = Math.min(options?.limit ?? 100, 500);
    const r = await this.request('search3', { query: '', musicFolderId: libraryId, artistCount: '0', albumCount: '0', songOffset: String(offset), songCount: String(limit) });
    const body = z.object({ song: z.array(song).default([]) }).parse(r.searchResult3);
    const items: MediaLibraryItem[] = body.song.map(e => ({ ratingKey: e.id, title: e.title, mediaType: 'track',
      addedAt: e.created ? new Date(e.created) : new Date(0), year: e.year, audioCodec: e.suffix,
      audioChannels: e.channelCount, grandparentTitle: e.artist, grandparentRatingKey: e.artistId,
      parentTitle: e.album, parentRatingKey: e.albumId, itemIndex: e.track }));
    return { items, totalCount: offset + items.length + (items.length === limit ? 1 : 0), rawCount: items.length };
  }
  async terminateSession(): Promise<boolean> { throw new Error('Navidrome does not support remote session termination'); }
}

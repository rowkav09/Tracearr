import { describe, it, expect, vi, afterEach } from 'vitest';
import { NavidromeClient, parseNowPlaying } from '../navidrome/client.js';
const entry = { id: 'song-1', title: 'Track', username: 'rowan', playerName: 'Symfonium',
  duration: 180, positionMs: 60000, state: 'playing', artist: 'Artist', album: 'Album',
  suffix: 'flac', bitRate: 800, track: 3, discNumber: 1 };
afterEach(()=>{ vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('Navidrome adapter',()=>{
  it('maps music and measured playback without inventing network or output codec',()=>{
    const s=parseNowPlaying([entry])[0]!;
    expect(s.music).toEqual({artistName:'Artist',albumName:'Album',trackNumber:3,discNumber:1});
    expect(s.media.durationMs).toBe(180000); expect(s.playback.positionMs).toBe(60000);
    expect(s.quality.sourceAudioDetails?.bitrate).toBe(800);
    expect(s.quality.streamAudioCodec).toBeUndefined(); expect(s.network.ipAddress).toBe('');
  });
  it('does not use Navidrome response indices as session keys',()=>{
    expect(parseNowPlaying([{...entry,playerId:1}])[0]!.sessionKey).toBe(parseNowPlaying([{...entry,playerId:5}])[0]!.sessionKey);
  });
  it('keeps client identity across track changes for the normal media-change lifecycle',()=>{
    expect(parseNowPlaying([entry])[0]!.sessionKey).toBe(parseNowPlaying([{...entry,id:'song-2'}])[0]!.sessionKey);
  });
  it('rejects ambiguous simultaneous sessions instead of double counting',()=>{expect(parseNowPlaying([entry,{...entry,id:'song-2'}])).toEqual([]);});
  it('ignores stopped sessions and preserves pause',()=>{
    expect(parseNowPlaying([{...entry,state:'stopped'}])).toEqual([]);
    expect(parseNowPlaying([{...entry,state:'paused'}])[0]!.playback.state).toBe('paused');
  });
  it('fails malformed polling instead of reporting an empty server',()=>{expect(()=>parseNowPlaying([{...entry,positionMs:undefined}])).toThrow();});
  it('is separately disabled by default',()=>{vi.stubEnv('ATHENAEUM_NAVIDROME_ENABLED','false');expect(()=>new NavidromeClient({url:'http://local',token:'{}'})).toThrow('disabled');});
  it('uses POST token auth and refuses redirects',async()=>{
    vi.stubEnv('ATHENAEUM_NAVIDROME_ENABLED','true');
    const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({'subsonic-response':{status:'ok',nowPlaying:{entry:[]}}})));
    vi.stubGlobal('fetch',fetcher);
    await new NavidromeClient({url:'http://navidrome:4533',token:JSON.stringify({username:'admin',password:'secret'})}).getSessions();
    const [url,opts]=fetcher.mock.calls[0]!;
    expect(url).toBe('http://navidrome:4533/rest/getNowPlaying.view');expect(opts.method).toBe('POST');expect(opts.redirect).toBe('error');
    expect(opts.body.get('p')).toBeNull();expect(opts.body.get('t')).toHaveLength(32);
  });
  it('reads the OpenSubsonic nowPlayingList envelope', async()=>{
    vi.stubEnv('ATHENAEUM_NAVIDROME_ENABLED','true');
    const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({'subsonic-response':{status:'ok',nowPlayingList:{entry:[entry]}}})));
    vi.stubGlobal('fetch',fetcher);
    const sessions=await new NavidromeClient({url:'http://navidrome:4533',token:JSON.stringify({username:'admin',password:'secret'})}).getSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.mediaId).toBe('song-1');
  });
});

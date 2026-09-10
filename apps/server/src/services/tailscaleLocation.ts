import { readFile, stat } from 'node:fs/promises';
import { isIP } from 'node:net';
import { z } from 'zod';
import type { ServerType } from '@tracearr/shared';
import { lookupGeoIP } from './plexGeoip.js';
import type { GeoLocation } from './geoip.js';
import { tailscaleService } from './tailscale.js';

const peerSchema = z.object({ TailscaleIPs: z.array(z.string()), CurAddr: z.string().optional(),
  Relay: z.string().optional(), PeerRelay: z.string().optional(), Online: z.boolean().optional(), Active: z.boolean().optional() });
const snapshotSchema = z.object({ capturedAt: z.number(), status: z.object({ BackendState: z.literal('Running'),
  Peer: z.record(z.string(), peerSchema) }) });
export type PeerSnapshot = z.infer<typeof snapshotSchema>;
export function isTailscaleIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  return isIP(ip) === 4 && parts[0] === 100 && parts[1]! >= 64 && parts[1]! <= 127;
}
export function publicEndpoint(endpoint: string): string | null {
  const match = /^(?:\[([^\]]+)\]|([^:]+)):(\d+)$/.exec(endpoint);
  if (!match || Number(match[3]) < 1 || Number(match[3]) > 65535) return null;
  const ip = match[1] ?? match[2]!;
  if (isIP(ip) === 4) {
    const [a, b, c] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || a! >= 224 || (a === 100 && b! >= 64 && b! <= 127) ||
      (a === 169 && b === 254) || (a === 172 && b! >= 16 && b! <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0) || (a === 192 && b === 88 && c === 99) || (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return null;
    return ip;
  }
  // Accept globally routed IPv6 only; exclude documentation, transition and protocol assignments.
  if (isIP(ip) === 6 && /^[23]/i.test(ip) && !/^2001:(?:0*:|0?db8:|[01][0-9a-f]{0,2}:)/i.test(ip) && !/^2002:/i.test(ip) && !/^3fff:/i.test(ip)) return ip;
  return null;
}
export function resolvePeer(ip: string, snapshot: PeerSnapshot, now = Date.now()) {
  const unknown = { tailnetIP: ip, endpoint: null as string | null, connection: 'unknown', relay: null as string | null };
  if (!isTailscaleIP(ip) || now - snapshot.capturedAt > 45000 || snapshot.capturedAt > now + 5000) return unknown;
  const matches = Object.values(snapshot.status.Peer).filter(p => p.TailscaleIPs.includes(ip));
  if (matches.length !== 1) return unknown;
  const peer = matches[0]!;
  if (!peer.Online || !peer.Active) return unknown;
  if (peer.PeerRelay) return { ...unknown, connection: 'peer-relay' };
  const endpoint = peer.CurAddr ? publicEndpoint(peer.CurAddr) : null;
  if (endpoint) return { ...unknown, connection: 'direct', endpoint };
  return { ...unknown, connection: peer.Relay ? 'relay' : 'unknown', relay: peer.Relay ?? null };
}
export async function readPeerSnapshot(): Promise<PeerSnapshot | null> {
  const path = process.env.ATHENAEUM_TAILSCALE_STATUS_FILE;
  if (process.env.ATHENAEUM_TAILSCALE_ENABLED !== 'true') return null;
  if (path) {
    try {
      if ((await stat(path)).size <= 4 * 1024 * 1024) {
        return snapshotSchema.parse(JSON.parse(await readFile(path, 'utf8')));
      }
    } catch { /* A configured host snapshot must never fall back to another node. */ }
    return null;
  }
  const live = await tailscaleService.getPeerSnapshot();
  if (!live) return null;
  const parsed = snapshotSchema.safeParse({ capturedAt: Date.now(), status: live });
  return parsed.success ? parsed.data : null;
}
const unknownLocation: GeoLocation = { city: null, region: null, country: null, countryCode: null,
  continent: null, postal: null, lat: null, lon: null, asnNumber: null, asnOrganization: null };
export async function lookupSessionGeoIP(ip: string, usePlexGeoip: boolean, serverType: ServerType): Promise<GeoLocation> {
  if (serverType !== 'jellyfin' || !isTailscaleIP(ip) || process.env.ATHENAEUM_TAILSCALE_ENABLED !== 'true') return lookupGeoIP(ip, usePlexGeoip);
  const snapshot = await readPeerSnapshot();
  const peer = snapshot ? resolvePeer(ip, snapshot) : null;
  // Never geolocate a DERP server, stale endpoint, or advertised candidate address.
  return peer?.endpoint ? lookupGeoIP(peer.endpoint, usePlexGeoip) : { ...unknownLocation };
}

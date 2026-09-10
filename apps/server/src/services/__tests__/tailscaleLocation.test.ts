import { describe,it,expect } from 'vitest';
import { isTailscaleIP, publicEndpoint, resolvePeer, type PeerSnapshot } from '../tailscaleLocation.js';
const now=1700000000000;
const snapshot: PeerSnapshot={capturedAt:now,status:{BackendState:'Running',Peer:{p:{TailscaleIPs:['100.89.1.2'],Online:true,Active:true,CurAddr:'8.8.8.8:41641',Relay:'lhr'}}}};
describe('Tailscale endpoint resolution',()=>{
 it('limits mapping to the exact CGNAT range',()=>{for(const ip of ['100.64.0.0','100.127.255.255'])expect(isTailscaleIP(ip)).toBe(true);for(const ip of ['100.63.255.255','100.128.0.0','100.999.1.1','10.1.1.1'])expect(isTailscaleIP(ip)).toBe(false);});
 it('accepts only public current endpoints',()=>{expect(publicEndpoint('[2606:4700:4700::1111]:41641')).toBe('2606:4700:4700::1111');for(const ip of ['192.168.1.2:44','100.89.1.2:44','127.0.0.1:44','198.51.100.1:44','[::1]:44','[fe80::1]:44','[::ffff:8.8.8.8]:44','[2001:db8::1]:44','8.8.8.8:99999','dns.example:44'])expect(publicEndpoint(ip)).toBeNull();});
 it('uses CurAddr even when a home DERP region is listed',()=>{expect(resolvePeer('100.89.1.2',snapshot,now).endpoint).toBe('8.8.8.8');});
 it('leaves DERP-only peers as relay metadata',()=>{const s=structuredClone(snapshot);s.status.Peer.p!.CurAddr='';expect(resolvePeer('100.89.1.2',s,now)).toEqual({tailnetIP:'100.89.1.2',endpoint:null,connection:'relay',relay:'lhr'});});
 it('rejects stale, offline, inactive, and peer-relayed endpoints',()=>{
   expect(resolvePeer('100.89.1.2',snapshot,now+45001).endpoint).toBeNull();
   for(const patch of [{Online:false},{Active:false},{PeerRelay:'100.1.2.3'}]){const s=structuredClone(snapshot);Object.assign(s.status.Peer.p!,patch);expect(resolvePeer('100.89.1.2',s,now).endpoint).toBeNull();}
 });
 it('does not use unrelated peers',()=>{expect(resolvePeer('100.89.1.3',snapshot,now).endpoint).toBeNull();});
});

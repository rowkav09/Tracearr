# Athenaeum integrations

The `athenaeum` branch adds two optional integrations to Tracearr v2.2.3:

- Navidrome is a fourth media-server type. Tracearr polls OpenSubsonic `getNowPlaying`, maps the returned user, track, album, artist, duration, position, bitrate, codec suffix and player into the existing normalized session model, and lets the normal poller close sessions and record plays. It does not write to Navidrome or Tracearr's database directly. Navidrome's stored listening history is not exposed as a portable admin endpoint, so historical plays are not backfilled.
- Jellyfin Tailscale client resolution is opt-in with `ATHENAEUM_TAILSCALE_ENABLED=true`. The resolver accepts a 100.64.0.0/10 address only when it matches one current peer, the peer is online and active, and `CurAddr` is a public endpoint. DERP/relay, stale, offline, ambiguous and private endpoints stay unknown with no GeoIP lookup. Tracearr's own connected Tailscale daemon can provide the peer table; alternatively, set `ATHENAEUM_TAILSCALE_STATUS_FILE` to a read-only JSON snapshot with `{capturedAt,status:{BackendState:"Running",Peer:{...}}}`.

`ATHENAEUM_NAVIDROME_ENABLED=true` must be set before adding or polling a Navidrome server. Store its token as JSON containing only the Navidrome administrator credentials, for example `{"username":"admin","password":"..."}`. Do not put that value in this document, a public image, or a log.

The branch layout is intentionally simple:

```text
upstream/main  ->  fork main  ->  athenaeum
```

Keep `main` free of local changes. To synchronize it later:

```powershell
git fetch upstream
git switch main
git merge --ff-only upstream/main
git switch athenaeum
git rebase main
```

Resolve and test conflicts on `athenaeum` before building a replacement image. The live deployment should use a separate image tag and the existing `tracearr_timescale_data`, `tracearr_redis_data` and `tracearr_backups` volumes. Rollback is the same Compose operation with the official `ghcr.io/connorgallopo/tracearr:latest` image; do not remove those volumes.

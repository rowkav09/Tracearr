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

For Jellyfin reached through the Windows host's Tailscale address, use that host's peer table. `docker/export-tailscale-peers.ps1 -OutputDirectory <directory>` refreshes a minimal snapshot every 15 seconds using only `tailscale status --json`. Mount the directory read-only at `/peer-state` and set `ATHENAEUM_TAILSCALE_STATUS_FILE=/peer-state/peers.json`. A configured snapshot that is unavailable or invalid does not fall back to another node. Snapshots expire after 45 seconds. The exporter does not ping peers or change Tailscale settings. Register it as a hidden login task under the existing host user for persistence; when that user is not logged in or the exporter stops, location fails closed.

On a memory-constrained Docker host, build the shared, translations, server and web packages on Windows, then stage only shared/server/web dist directories plus `build-info.json` and use `docker/Dockerfile.athenaeum-prebuilt`. This packaging method requires the exact v2.2.3 official image as its base and unchanged dependency lockfile and migration files. Use the standard Dockerfile if those change. Never include environment files or peer snapshots in an image context.

Before replacement, preserve the official image under a dated tag, take a full PostgreSQL dump and Redis snapshot, and archive `/app/data` in Linux tar format (cached filenames may be invalid on Windows). Check for active sessions again immediately before replacing only the app with Compose `up -d --no-deps tracearr`. If playback has started, defer the replacement. Preserve the database/Redis volumes and use the dated official tag for rollback.

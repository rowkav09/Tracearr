# Athenaeum integrations

## Deployed status (2026-09-10)

The running custom image is `tracearr-athenaeum:music-20260910`, based on official v2.2.3. It includes the host snapshot resolver and the music statistics fix through source commit `7cee2684`. HTTP health and ongoing session recording were verified after replacement. Existing history was retained; the official image, database, Redis, app-local files and deployment configuration have separate rollback copies stored locally (never in this repository).

The Tailscale resolver is enabled and receiving fresh host snapshots. During final verification, no eligible direct peer endpoint was present, so live geolocation remained unknown. This validates the fail-closed path, not the accuracy of any person's location. GeoIP is approximate and DERP locations must not be substituted for client locations.

Navidrome support is available and its feature switch is enabled, but no Navidrome server was provisioned in Tracearr by this deployment. Previously stored Navidrome plays are not imported. Plexamp totals now use existing recorded music sessions; video-specific rankings and engagement aggregates retain their video scope.

The host experienced memory-allocation errors at Jellyfin's library-discovery endpoint. A 4 GB WSL setting was saved, but the last check still showed the old running limit. Applying that setting requires a full WSL restart and is a separate maintenance action.

## Updates

The fork's `main` was fast-forwarded to upstream `28b8c344` on 2026-09-10. Keep it identical to upstream: do not add fork-specific workflows or documentation commits there. Custom documentation is on `athenaeum` and linked from the fork description.

A daily Codex maintenance task checks upstream, fast-forwards clean `main`, and prepares Athenaeum updates in an isolated candidate branch. It validates builds and relevant tests before updating the custom branch, reports conflicts or failures, and never deploys or restarts services automatically. The scheduled task is attached to the local Codex task; it is not a GitHub-hosted workflow.

For a published custom branch, prefer merging upstream into a candidate branch rather than rewriting history. Preserve a backup ref before integration. Advance `athenaeum` only after validation succeeds and its remote head has not changed. Dependency or migration changes require a full rebuild and rollback compatibility review; do not reuse the v2.2.3 prebuilt packaging shortcut across such updates.

The `athenaeum` branch adds two optional integrations to Tracearr v2.2.3:

- Navidrome is a fourth media-server type. Tracearr polls OpenSubsonic `getNowPlaying`, maps the returned user, track, album, artist, duration, position, bitrate, codec suffix and player into the existing normalized session model, and lets the normal poller close sessions and record plays. It does not write to Navidrome or Tracearr's database directly. Navidrome's stored listening history is not exposed as a portable admin endpoint, so historical plays are not backfilled.
- Jellyfin Tailscale client resolution is opt-in with `ATHENAEUM_TAILSCALE_ENABLED=true`. The resolver accepts a 100.64.0.0/10 address only when it matches one current peer, the peer is online and active, and `CurAddr` is a public endpoint. DERP/relay, stale, offline, ambiguous and private endpoints stay unknown with no GeoIP lookup. Tracearr's own connected Tailscale daemon can provide the peer table; alternatively, set `ATHENAEUM_TAILSCALE_STATUS_FILE` to a read-only JSON snapshot with `{capturedAt,status:{BackendState:"Running",Peer:{...}}}`.

`ATHENAEUM_NAVIDROME_ENABLED=true` must be set before adding or polling a Navidrome server. Store its token as JSON containing only the Navidrome administrator credentials, for example `{"username":"admin","password":"..."}`. Do not put that value in this document, a public image, or a log.

Music tracks (including existing Plexamp history) now contribute to the dashboard, play charts and user statistics through the primary media-type filters. No history rewrite or database migration is needed. The existing two-minute minimum for counted plays remains; listening-duration totals include recorded track duration. Video engagement aggregates and movie/show rankings keep their existing scope. Live verification changed today's Plex-only dashboard from zero to 9 qualifying plays, 26 sessions and 0.6 hours at deployment time.

The branch layout is intentionally simple:

```text
upstream/main  ->  fork main  ->  athenaeum
```

Keep `main` free of local changes. To synchronize it later:

```powershell
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
git switch -c athenaeum-sync-YYYYMMDD athenaeum
git merge main
```

Resolve conflicts and validate the candidate before advancing `athenaeum` or building a replacement image. The live deployment should use a separate image tag and the existing `tracearr_timescale_data`, `tracearr_redis_data` and `tracearr_backups` volumes. Rollback uses the dated preserved official image rather than a moving `latest` tag; do not remove those volumes.

For Jellyfin reached through the Windows host's Tailscale address, use that host's peer table. `docker/export-tailscale-peers.ps1 -OutputDirectory <directory>` refreshes a minimal snapshot every 15 seconds using only `tailscale status --json`. Mount the directory read-only at `/peer-state` and set `ATHENAEUM_TAILSCALE_STATUS_FILE=/peer-state/peers.json`. A configured snapshot that is unavailable or invalid does not fall back to another node. Snapshots expire after 45 seconds. The exporter does not ping peers or change Tailscale settings. Register it as a hidden login task under the existing host user for persistence; when that user is not logged in or the exporter stops, location fails closed.

On a memory-constrained Docker host, build the shared, translations, server and web packages on Windows, then stage only shared/server/web dist directories plus `build-info.json` and use `docker/Dockerfile.athenaeum-prebuilt`. This packaging method requires the exact v2.2.3 official image as its base and unchanged dependency lockfile and migration files. Use the standard Dockerfile if those change. Never include environment files or peer snapshots in an image context.

Before replacement, preserve the official image under a dated tag, take a full PostgreSQL dump and Redis snapshot, and archive `/app/data` in Linux tar format (cached filenames may be invalid on Windows). Check for active sessions again immediately before replacing only the app with Compose `up -d --no-deps tracearr`. If playback has started, defer the replacement. Preserve the database/Redis volumes and use the dated official tag for rollback.

# Configuration and validation

## Status

The deployed image was built from the v2.2.3-based feature changes through commit `7cee2684`. The repository now also includes later upstream changes. Publishing those source changes does not upgrade the running container; a fresh build and validation are required before deploying a newer upstream base.

The music statistics fix passed seven route tests and was verified against the live dashboard. The Navidrome adapter and Tailscale resolver passed fifteen focused tests. These results describe the deployed feature revision, not a complete test of every later upstream change.

The live Tailscale reader receives fresh host snapshots. The final location check had no eligible direct endpoint, so it correctly returned unknown; a real client's geographic accuracy has not been established. Navidrome support is available but the deployment did not provision a Navidrome server in Tracearr.

## Configuration

Existing installations retain these compatibility environment names:

- `ATHENAEUM_TAILSCALE_ENABLED=true`: enable client location resolution.
- `ATHENAEUM_TAILSCALE_STATUS_FILE=/peer-state/peers.json`: read the host snapshot.
- `ATHENAEUM_NAVIDROME_ENABLED=true`: enable the Navidrome adapter.

These identifiers remain for compatibility with deployed configurations; they are not the fork's name.

Run `docker/export-tailscale-peers.ps1 -OutputDirectory <directory>` on the Windows host whose Tailscale connection receives Jellyfin traffic. It reads status every 15 seconds. Mount that directory read-only in Tracearr. Snapshots expire after 45 seconds, and an invalid configured host snapshot never falls back to another node. A hidden login task can keep the exporter running; if it stops, locations become unknown.

Add Navidrome using administrator credentials encoded as JSON in the server credential field: `{"username":"admin","password":"..."}`. Do not commit credentials, peer snapshots or private backups.

## Limits

- Music is included in primary statistics without rewriting saved history. Counted plays retain the existing two-minute minimum.
- Video engagement aggregates and movie/show rankings are unchanged.
- Navidrome history is recorded prospectively through polling; old listening history is not backfilled.
- Unknown network addresses and delivered codecs are not invented.
- Duplicate simultaneous user/client pairs are omitted when they cannot be distinguished.
- Tailscale endpoint locations are approximate GeoIP results. DERP-only peers remain unknown.

## Build and rollback

Use the normal build on an updated upstream base. The existing prebuilt Dockerfile is a v2.2.3-only packaging shortcut: it requires unchanged dependencies and migrations compared with that exact official image. Do not use it to package the newer merged source over the old runtime.

Before deployment, preserve the exact current image under a dated tag, take a full PostgreSQL dump and Redis snapshot, and archive app-local data in Linux tar format. Keep the existing database, Redis and history volumes. Replace only the application container. A tracking restart can briefly interrupt statistics even though media playback continues.

Rollback uses the preserved image and existing data volumes. Review any new migrations before updating; image rollback alone is not sufficient when an upstream migration is incompatible. Private deployment scripts and backups stay outside the repository.

## Upstream maintenance

Keep `upstream-main` identical to `connorgallopo/Tracearr:main`. Keep custom changes on this fork's `main` and `music-stats-navidrome-tailscale`.

Fetch upstream, preserve a backup ref and create an isolated candidate from the custom main. Merge upstream into that candidate, resolve conflicts, install the locked dependencies and run relevant tests and production builds. Only advance the custom branches after checks succeed and their remote heads have not changed. Never force-sync custom main with upstream.

A daily local Codex maintenance task follows this process and reports tested updates or actionable failures. It does not deploy, restart services or change live settings automatically.

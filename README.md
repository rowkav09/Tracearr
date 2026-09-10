# Music statistics, Navidrome and Tailscale client locations

This fork addresses three problems in a media-server setup using Plexamp, Jellyfin over Tailscale, and Navidrome.

## The problems

- **Plexamp shows an active stream, but listening does not appear in the main statistics.** Track sessions and durations are saved, while the primary dashboard and statistics filters exclude music.
- **Jellyfin reports a Tailscale client address instead of a usable location.** An address in `100.64.0.0/10` identifies a tailnet peer, not its public geographic location. A relay server's location is not the listener's location.
- **Navidrome has no native server adapter here.** Its users, current playback and music metadata need to enter the normal session-tracking pipeline.

## What this fork changes

| Area | Difference |
| --- | --- |
| Music statistics | Includes recorded tracks in dashboard totals, play charts and user statistics, including existing Plexamp history. |
| Tailscale locations | Reads the host's current peer state and uses a public `CurAddr` only for an active, online, directly connected peer. |
| Relay and missing data | Leaves locations unknown when data is stale, ambiguous, relayed or unavailable. |
| Navidrome | Adds an optional OpenSubsonic adapter for users, libraries and current playback, with artist, album, track, duration, position, source bitrate/codec and client metadata. |
| Data preservation | Uses the normal tracking lifecycle; no direct history rewrites. Keeps a separately tagged official image and data backups for rollback. |

Music play counts retain the existing two-minute minimum. Video-specific rankings and engagement reports keep their existing scope. Navidrome historical backfill is not implemented, and simultaneous sessions with the same user/client identity cannot be reliably distinguished.

Both integrations are separately configurable. The Tailscale reader does not change routes, spoof headers or disconnect clients. Location accuracy still depends on GeoIP and a real direct endpoint.

## Branches and updates

- `main` contains this fork's changes.
- `music-stats-navidrome-tailscale` is the descriptive feature branch.
- `upstream-main` is an unchanged mirror of the original project's main branch.

Daily maintenance merges upstream changes into a separate candidate, checks builds and tests, and advances the custom branches only after validation. It does not automatically deploy or restart the server.

See [configuration, validation status and rollback](docs/music-and-client-locations.md) for implementation details. General Tracearr documentation, screenshots and installation instructions remain in [the original project](https://github.com/connorgallopo/Tracearr).

This is a fork of Tracearr and retains its [AGPL-3.0 license](LICENSE).

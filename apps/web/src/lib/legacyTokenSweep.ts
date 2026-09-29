import { tokenStorage } from '@/lib/api';

/**
<<<<<<< HEAD
 * Boot sweep of legacy localStorage auth tokens left behind by older builds.
 * Cookie sessions replaced these tokens.
=======
 * One-time boot sweep of legacy localStorage auth tokens. Cookie sessions
 * replaced these tokens; until the remaining writer (Connections.tsx, for
 * the Jellyfin/Emby API-key connect flow) is removed in a follow-up task, a
 * token written during a session can still exist until the next boot -
 * that's expected during the transition.
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
 */
export function sweepLegacyTokens(): void {
  tokenStorage.clearTokens(true);
}

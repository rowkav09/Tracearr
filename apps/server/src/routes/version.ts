/**
 * Version API Routes
 *
 * Provides version information and update status.
 */

import type { FastifyPluginAsync } from 'fastify';
<<<<<<< HEAD
import { isNewerVersion, isPrerelease, type VersionInfo } from '@tracearr/shared';
=======
import type { VersionInfo } from '@tracearr/shared';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import {
  getCurrentVersion,
  getCurrentTag,
  getCurrentCommit,
  getBuildDate,
  getCachedLatestVersion,
<<<<<<< HEAD
=======
  isNewerVersion,
  isPrerelease,
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  forceVersionCheck,
} from '../jobs/versionCheckQueue.js';

export const versionRoutes: FastifyPluginAsync = async (app) => {
  /**
   * GET /version
   * Get current version info and update status
   * Public endpoint - no auth required (useful for health checks)
   */
  app.get<{
    Reply: VersionInfo;
  }>('/', async () => {
    const currentVersion = getCurrentVersion();
    const currentTag = getCurrentTag();
    const currentCommit = getCurrentCommit();
    const buildDate = getBuildDate();

    // Get cached latest version info
    const latestData = await getCachedLatestVersion();

    // Determine if update is available
    const updateAvailable = latestData ? isNewerVersion(latestData.version, currentVersion) : false;

    return {
      current: {
        version: currentVersion,
        tag: currentTag,
        commit: currentCommit,
        buildDate,
        isPrerelease: isPrerelease(currentVersion),
      },
      latest: latestData
        ? {
            version: latestData.version,
            tag: latestData.tag,
            releaseUrl: latestData.releaseUrl,
            publishedAt: latestData.publishedAt,
            isPrerelease: latestData.isPrerelease,
            releaseName: latestData.releaseName,
            releaseNotes: latestData.releaseNotes,
<<<<<<< HEAD
            upgradeWarnings: latestData.upgradeWarnings.filter((w) =>
              isNewerVersion(w.version, currentVersion)
            ),
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
          }
        : null,
      updateAvailable,
      lastChecked: latestData?.checkedAt ?? null,
    };
  });

  /**
   * POST /version/check
   * Force an immediate version check (admin only)
   */
  app.post('/check', {
    preHandler: [app.authenticate],
    handler: async (request, reply) => {
      // Require admin role
      if (request.user.role !== 'owner' && request.user.role !== 'admin') {
        return reply.forbidden('Admin access required');
      }

      await forceVersionCheck();

      return { message: 'Version check queued' };
    },
  });
};

/**
 * Library Resolution Route
 *
 * GET /resolution - Resolution distribution for library items by media type
 *
<<<<<<< HEAD
 * Returns per-tier counts split by:
=======
 * Returns resolution breakdowns (4K, 1080p, 720p, SD) split by:
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
 * - Movies
 * - TV Shows (episodes)
 */

import type { FastifyPluginAsync } from 'fastify';
<<<<<<< HEAD
import { sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import {
  REDIS_KEYS,
  CACHE_TTL,
  RESOLUTION_BUCKETS,
  uuidSchema,
  type LibraryResolutionResponse,
  type ResolutionBreakdown,
} from '@tracearr/shared';
import { db } from '../../db/client.js';
import { readResolutionCounts, versionBucketFlagsJoin } from '../../utils/resolutionBuckets.js';
=======
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { REDIS_KEYS, CACHE_TTL, uuidSchema } from '@tracearr/shared';
import { db } from '../../db/client.js';
import { hasVersionInBucket } from '../../utils/resolutionBuckets.js';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import {
  validateServerAccess,
  resolveServerIds,
  buildMultiServerFragment,
} from '../../utils/serverFiltering.js';
import { buildLibraryCacheKey } from './utils.js';

/** Query schema for resolution endpoint */
const resolutionQuerySchema = z.object({
  serverId: uuidSchema.optional(),
  libraryId: uuidSchema.optional(),
});

type ResolutionQueryInput = z.infer<typeof resolutionQuerySchema>;

<<<<<<< HEAD
/** Items with no resolution at all count as SD here, unlike the snapshot writers. */
function bucketCountsSelect(): SQL {
  return sql.join(
    RESOLUTION_BUCKETS.map((bucket) =>
      bucket === 'sd'
        ? sql`COUNT(*) FILTER (WHERE vb.has_sd OR library_items.video_resolution IS NULL)::int AS count_sd`
        : sql`COUNT(*) FILTER (WHERE ${sql.raw(`vb.has_${bucket}`)})::int AS ${sql.raw(`count_${bucket}`)}`
    ),
    sql`, `
  );
}

function buildBreakdown(row: Record<string, unknown> | undefined): ResolutionBreakdown {
  const counts = readResolutionCounts(row);
  const total = RESOLUTION_BUCKETS.reduce((sum, bucket) => sum + counts[bucket], 0);
  return { counts, total };
=======
/** Single resolution entry with count and percentage */
interface ResolutionEntry {
  resolution: string;
  count: number;
  percentage: number;
}

/** Resolution breakdown for a media type */
interface ResolutionBreakdown {
  count4k: number;
  count1080p: number;
  count720p: number;
  countSd: number;
  total: number;
  entries: ResolutionEntry[];
}

/** Response structure for resolution endpoint */
interface LibraryResolutionResponse {
  movies: ResolutionBreakdown;
  tv: ResolutionBreakdown;
}

/**
 * Convert raw counts to ResolutionBreakdown with percentages
 */
function buildBreakdown(
  count4k: number,
  count1080p: number,
  count720p: number,
  countSd: number
): ResolutionBreakdown {
  const total = count4k + count1080p + count720p + countSd;
  const pct = (count: number) => (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);

  const entries: ResolutionEntry[] = [];

  if (count4k > 0) {
    entries.push({ resolution: '4K', count: count4k, percentage: pct(count4k) });
  }
  if (count1080p > 0) {
    entries.push({ resolution: '1080p', count: count1080p, percentage: pct(count1080p) });
  }
  if (count720p > 0) {
    entries.push({ resolution: '720p', count: count720p, percentage: pct(count720p) });
  }
  if (countSd > 0) {
    entries.push({ resolution: 'SD', count: countSd, percentage: pct(countSd) });
  }

  return {
    count4k,
    count1080p,
    count720p,
    countSd,
    total,
    entries,
  };
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
}

export const libraryResolutionRoute: FastifyPluginAsync = async (app) => {
  /**
   * GET /resolution - Resolution distribution by media type
   *
   * Returns resolution breakdowns for movies and TV shows.
   */
  app.get<{ Querystring: ResolutionQueryInput }>(
    '/resolution',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const query = resolutionQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.badRequest('Invalid query parameters');
      }

      const { serverId, libraryId } = query.data;
      const authUser = request.user;

      // Validate server access
      if (serverId) {
        const error = validateServerAccess(authUser, serverId);
        if (error) {
          return reply.forbidden(error);
        }
      }

      const resolvedIds = resolveServerIds(authUser, serverId, undefined, { strict: false });
      const serverCacheSegment =
        resolvedIds !== undefined ? resolvedIds.slice().sort().join(',') : 'all';

      // Build cache key
      const cacheKey = buildLibraryCacheKey(
        REDIS_KEYS.LIBRARY_RESOLUTION ?? 'library:resolution',
        serverCacheSegment,
        libraryId ?? 'all'
      );

      // Try cache first
      const cached = await app.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as LibraryResolutionResponse;
        } catch {
          // Fall through to compute
        }
      }

      // Build server filter
      const serverFilter = buildMultiServerFragment(resolvedIds);

      // Library filter
      const libraryFilter = libraryId ? sql`AND library_id = ${libraryId}` : sql``;

<<<<<<< HEAD
      const countsFor = (mediaType: 'movie' | 'episode') =>
        db.execute(sql`
          SELECT ${bucketCountsSelect()}
          FROM library_items
          ${versionBucketFlagsJoin('library_items.id', { includeNullAsSd: true })}
          WHERE media_type = ${mediaType}
            AND removed_at IS NULL
            ${serverFilter}
            ${libraryFilter}
        `);

      const moviesResult = await countsFor('movie');
      const tvResult = await countsFor('episode');

      const response: LibraryResolutionResponse = {
        movies: buildBreakdown(moviesResult.rows[0]),
        tv: buildBreakdown(tvResult.rows[0]),
=======
      // Query resolution counts for movies
      const moviesResult = await db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '4k')})::int AS count_4k,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '1080p')})::int AS count_1080p,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '720p')})::int AS count_720p,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', 'sd', { includeNullAsSd: true })}
                             OR video_resolution IS NULL)::int AS count_sd
        FROM library_items
        WHERE media_type = 'movie'
          AND removed_at IS NULL
          ${serverFilter}
          ${libraryFilter}
      `);

      // Query resolution counts for TV episodes
      const tvResult = await db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '4k')})::int AS count_4k,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '1080p')})::int AS count_1080p,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', '720p')})::int AS count_720p,
          COUNT(*) FILTER (WHERE ${hasVersionInBucket('library_items.id', 'sd', { includeNullAsSd: true })}
                             OR video_resolution IS NULL)::int AS count_sd
        FROM library_items
        WHERE media_type = 'episode'
          AND removed_at IS NULL
          ${serverFilter}
          ${libraryFilter}
      `);

      const moviesRow = moviesResult.rows[0] as
        | {
            count_4k: number;
            count_1080p: number;
            count_720p: number;
            count_sd: number;
          }
        | undefined;

      const tvRow = tvResult.rows[0] as
        | {
            count_4k: number;
            count_1080p: number;
            count_720p: number;
            count_sd: number;
          }
        | undefined;

      const response: LibraryResolutionResponse = {
        movies: buildBreakdown(
          moviesRow?.count_4k ?? 0,
          moviesRow?.count_1080p ?? 0,
          moviesRow?.count_720p ?? 0,
          moviesRow?.count_sd ?? 0
        ),
        tv: buildBreakdown(
          tvRow?.count_4k ?? 0,
          tvRow?.count_1080p ?? 0,
          tvRow?.count_720p ?? 0,
          tvRow?.count_sd ?? 0
        ),
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
      };

      // Cache for 5 minutes
      await app.redis.setex(
        cacheKey,
        CACHE_TTL.LIBRARY_RESOLUTION ?? 300,
        JSON.stringify(response)
      );

      return response;
    }
  );
};

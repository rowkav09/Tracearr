/**
 * sessionIdentityBackfill tests
 *
 * Covers the widened repair pass: sessions that already have media_id but were
<<<<<<< HEAD
 * stamped before their media row's show_media_id existed, and the unlink pass
 * for sessions linked to a container (show, season, artist, album). All three
 * passes run in the same transaction and their results combine into a single
 * updated/oldest result.
=======
 * stamped before their media row's show_media_id existed. Both the fresh-stamp
 * query and the repair query run in the same transaction and their results
 * combine into a single updated/oldest result.
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db/client.js', () => ({
  db: { transaction: vi.fn(), execute: vi.fn() },
}));

import { db } from '../../db/client.js';
import { renderSql } from '../../test/helpers.js';
import {
  backfillSessionIdentityBatch,
  hasStampableSessionsBefore,
  runSessionIdentityBackfillWalk,
} from '../sessionIdentityBackfill.js';
import type { SQL } from 'drizzle-orm';

function mockTransaction(executeResults: Array<{ rows: unknown[] }>) {
  const execute = vi.fn();
  for (const result of executeResults) execute.mockResolvedValueOnce(result);

  vi.mocked(db.transaction).mockImplementation((async (callback: (tx: unknown) => unknown) =>
    callback({ execute })) as never);
  return execute;
}

/** The probes run straight on db, not inside a transaction. */
function mockExecute(...results: Array<{ rows: unknown[] }>) {
  const execute = vi.fn().mockResolvedValue({ rows: [] });
  for (const result of results) execute.mockResolvedValueOnce(result);
  vi.mocked(db).execute = execute as never;
  return execute;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/** Transaction call 0 is always the decompression-cap GUC probe */
const GUC_ABSENT = { rows: [] };
const GUC_PRESENT = { rows: [{ '?column?': 1 }] };

<<<<<<< HEAD
const CONTAINER_TYPES = ['show', 'season', 'artist', 'album'];

/** The library_items EXISTS guard body, not the UPDATE's own WHERE */
function guardBody(text: string | undefined): string | undefined {
  return /FROM library_items li2?\b([\s\S]*?)\)\s*(?:ORDER BY|$)/.exec(text ?? '')?.[1];
}

async function renderBatchPasses(window?: { start: Date; end: Date }) {
  const execute = mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }, { rows: [] }]);
  await backfillSessionIdentityBatch(5000, window);
  expect(execute).toHaveBeenCalledTimes(4);
  return execute.mock.calls.slice(1).map((call) => renderSql(call[0] as SQL));
}

describe('backfillSessionIdentityBatch', () => {
  it('combines the counts of every pass and picks the oldest across them', async () => {
=======
describe('backfillSessionIdentityBatch', () => {
  it('combines the fresh-stamp and repair pass counts and picks the oldest across both', async () => {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    mockTransaction([
      GUC_ABSENT,
      {
        rows: [
          { started_at: '2024-01-05T00:00:00.000Z' },
          { started_at: '2024-01-01T00:00:00.000Z' },
        ],
      },
      { rows: [{ started_at: '2023-12-01T00:00:00.000Z' }] },
<<<<<<< HEAD
      { rows: [{ started_at: '2023-11-01T00:00:00.000Z' }] },
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    ]);

    const result = await backfillSessionIdentityBatch(5000);

<<<<<<< HEAD
    expect(result.updated).toBe(4);
    expect(result.oldest).toEqual(new Date('2023-11-01T00:00:00.000Z'));
  });

  it('runs every pass even when the fresh-stamp pass finds nothing', async () => {
=======
    expect(result.updated).toBe(3);
    expect(result.oldest).toEqual(new Date('2023-12-01T00:00:00.000Z'));
  });

  it('runs both passes even when the fresh-stamp pass finds nothing to repair', async () => {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    const execute = mockTransaction([
      GUC_ABSENT,
      { rows: [] },
      { rows: [{ started_at: '2024-02-01T00:00:00.000Z' }] },
<<<<<<< HEAD
      { rows: [] },
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    ]);

    const result = await backfillSessionIdentityBatch(5000);

    expect(result.updated).toBe(1);
    expect(result.oldest).toEqual(new Date('2024-02-01T00:00:00.000Z'));
<<<<<<< HEAD
    // GUC probe + fresh-stamp, repair and unlink queries, nothing else.
    expect(execute).toHaveBeenCalledTimes(4);
  });

  it('returns zero updated and a null oldest when no pass finds anything', async () => {
    mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }, { rows: [] }]);
=======
    // GUC probe + fresh-stamp query + repair query, nothing else.
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it('returns zero updated and a null oldest when neither pass finds anything', async () => {
    mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }]);
>>>>>>> e10e89cd (Limit image ownership changes to writable data)

    const result = await backfillSessionIdentityBatch(5000);

    expect(result).toEqual({ updated: 0, oldest: null });
  });

  it('lifts the decompression cap inside the transaction when the GUC exists', async () => {
    // The field failure: a compressed month-chunk decompresses more tuples
    // than the 100k default for one batch, and without SET LOCAL the walk
    // fail-retries forever
<<<<<<< HEAD
    const execute = mockTransaction([
      GUC_PRESENT,
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
    ]);

    await backfillSessionIdentityBatch(5000);

    expect(execute).toHaveBeenCalledTimes(5);
=======
    const execute = mockTransaction([GUC_PRESENT, { rows: [] }, { rows: [] }, { rows: [] }]);

    await backfillSessionIdentityBatch(5000);

    expect(execute).toHaveBeenCalledTimes(4);
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    const setLocal = renderSql(execute.mock.calls[1]![0] as SQL).sql;
    expect(setLocal).toContain(
      'SET LOCAL timescaledb.max_tuples_decompressed_per_dml_transaction = 0'
    );
  });
<<<<<<< HEAD

  it('refuses container library items in both the fresh-stamp update and its guard', async () => {
    const [fresh] = await renderBatchPasses();
    const [select, update] = fresh!.sql.split('UPDATE sessions s');

    expect(guardBody(select)).toMatch(/li2\.media_type NOT IN \(\$\d+, \$\d+, \$\d+, \$\d+\)/);
    expect(update).toMatch(/li\.media_type NOT IN \(\$\d+, \$\d+, \$\d+, \$\d+\)/);
    expect(fresh!.params).toEqual(expect.arrayContaining(CONTAINER_TYPES));
  });

  it('refuses a library item whose media row is a container, in the update, guard and probe', async () => {
    // The unlink pass keys on the media row's type, so a fresh stamp that only
    // checked the library item's type could re-stamp what unlink just cleared.
    const [fresh] = await renderBatchPasses();
    const [select, update] = fresh!.sql.split('UPDATE sessions s');
    const probeExecute = mockExecute({ rows: [{ stampable: false }] });
    await hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'));
    const [freshProbe] = renderSql(probeExecute.mock.calls[0]![0] as SQL).sql.split(
      /\)\s*OR EXISTS/
    );
    const containerMedia = (alias: string) =>
      new RegExp(
        `JOIN media ${alias} ON ${alias}\\.id = li2?\\.media_id[\\s\\S]*${alias}\\.media_type NOT IN \\(\\$\\d+, \\$\\d+, \\$\\d+, \\$\\d+\\)`
      );

    expect(guardBody(select)).toMatch(containerMedia('m2'));
    expect(update).toMatch(containerMedia('m'));
    expect(guardBody(freshProbe)).toMatch(containerMedia('m'));
  });

  it('unlinks sessions stamped with a container media row', async () => {
    const [, , unlink] = await renderBatchPasses();
    const text = unlink!.sql.replace(/\s+/g, ' ');

    expect(text).toContain('JOIN media m ON m.id = s.media_id');
    expect(text).toMatch(/m\.media_type IN \(\$\d+, \$\d+, \$\d+, \$\d+\)/);
    expect(unlink!.params).toEqual(expect.arrayContaining(CONTAINER_TYPES));
    expect(text).toContain(
      'SET media_id = NULL, show_media_id = NULL, imdb_id = NULL, tmdb_id = NULL, tvdb_id = NULL'
    );
    expect(text).toContain('RETURNING s.started_at');
  });
});

describe('backfillSessionIdentityBatch windowing', () => {
  it('bounds both the batch select and the update target of every pass when a window is given', async () => {
    const passes = await renderBatchPasses({
=======
});

describe('backfillSessionIdentityBatch windowing', () => {
  it('applies started_at bounds to both passes when a window is given', async () => {
    const execute = mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }]);

    await backfillSessionIdentityBatch(5000, {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
      start: new Date('2026-01-01T00:00:00.000Z'),
      end: new Date('2026-01-08T00:00:00.000Z'),
    });

<<<<<<< HEAD
    // Each pass must carry both bounds on its own, not just the union of the
    // passes, and on the UPDATE target as well as the batch that feeds it.
    expect(passes).toHaveLength(3);
    for (const { sql: text, params } of passes) {
      const [select, update] = text.split('UPDATE sessions s');
      for (const part of [select, update]) {
        expect(part).toMatch(/s\.started_at >= \$\d+::timestamptz/);
        expect(part).toMatch(/s\.started_at < \$\d+::timestamptz/);
      }
      expect(params.filter((p) => p === '2026-01-01T00:00:00.000Z')).toHaveLength(2);
      expect(params.filter((p) => p === '2026-01-08T00:00:00.000Z')).toHaveLength(2);
=======
    // After the GUC probe: the fresh-stamp pass, then the show-link repair
    // pass - each must carry both bounds, not just the union of the two.
    expect(execute).toHaveBeenCalledTimes(3);
    for (const call of execute.mock.calls.slice(1)) {
      const { sql: text, params } = renderSql(call[0] as SQL);
      expect(text).toContain('started_at >=');
      expect(text).toContain('started_at <');
      expect(params).toContain('2026-01-01T00:00:00.000Z');
      expect(params).toContain('2026-01-08T00:00:00.000Z');
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    }
  });

  it('omits the bounds when no window is given', async () => {
<<<<<<< HEAD
    for (const { sql: text } of await renderBatchPasses()) {
=======
    const execute = mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }]);
    await backfillSessionIdentityBatch(5000);
    for (const call of execute.mock.calls.slice(1)) {
      const { sql: text } = renderSql(call[0] as SQL);
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
      expect(text).not.toContain('started_at >=');
      expect(text).not.toContain('started_at <');
    }
  });
});

describe('hasStampableSessionsBefore', () => {
<<<<<<< HEAD
  it('answers from a single statement', async () => {
    const execute = mockExecute({ rows: [{ stampable: true }] });

    await expect(hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'))).resolves.toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(renderSql(execute.mock.calls[0]![0] as SQL).sql).toMatch(
      /^\s*SELECT EXISTS \([\s\S]*\) OR EXISTS \([\s\S]*\) OR EXISTS \([\s\S]*\) AS stampable\s*$/
    );
  });

  it('returns false when no probe finds work', async () => {
    const execute = mockExecute({ rows: [{ stampable: false }] });

    await expect(hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'))).resolves.toBe(false);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('bounds every probe below the cutoff', async () => {
    const execute = mockExecute({ rows: [{ stampable: false }] });

    await hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'));

    const { sql: text, params } = renderSql(execute.mock.calls[0]![0] as SQL);
    for (const probe of text.split(/\)\s*OR EXISTS/)) {
      expect(probe).toMatch(/s\.started_at < \$\d+::timestamptz/);
    }
    expect(params.filter((p) => p === '2026-08-01T00:00:00.000Z')).toHaveLength(3);
=======
  it('returns true from the fresh-stamp probe without running the repair probe', async () => {
    const execute = mockExecute({ rows: [{ '?column?': 1 }] });

    await expect(hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'))).resolves.toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('falls through to the repair probe and returns true when only that one hits', async () => {
    const execute = mockExecute({ rows: [] }, { rows: [{ '?column?': 1 }] });

    await expect(hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'))).resolves.toBe(true);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('falls through to the repair probe and returns false when both are empty', async () => {
    const execute = mockExecute({ rows: [] }, { rows: [] });

    await expect(hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'))).resolves.toBe(false);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('bounds both probes below the cutoff and caps them at one row', async () => {
    const execute = mockExecute({ rows: [] }, { rows: [] });

    await hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'));

    for (const call of execute.mock.calls) {
      const { sql: text, params } = renderSql(call[0] as SQL);
      expect(text).toContain('started_at <');
      expect(text).toContain('LIMIT 1');
      expect(params).toContain('2026-08-01T00:00:00.000Z');
    }
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  });
});

describe('probe / batch predicate drift', () => {
  it('pins each probe predicate and keeps it in step with the batch query it mirrors', async () => {
<<<<<<< HEAD
    const probeExecute = mockExecute({ rows: [{ stampable: false }] });
    await hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'));
    const [freshProbe, repairProbe, unlinkProbe] = renderSql(
      probeExecute.mock.calls[0]![0] as SQL
    ).sql.split(/\)\s*OR EXISTS/);

    const [freshBatch, repairBatch, unlinkBatch] = (await renderBatchPasses()).map(
      (pass) => pass.sql
    );

=======
    const probeExecute = mockExecute({ rows: [] }, { rows: [] });
    await hasStampableSessionsBefore(new Date('2026-08-01T00:00:00Z'));
    const [freshProbe, repairProbe] = probeExecute.mock.calls.map(
      (call) => renderSql(call[0] as SQL).sql
    );

    const batchExecute = mockTransaction([GUC_ABSENT, { rows: [] }, { rows: [] }]);
    await backfillSessionIdentityBatch(5000);
    const [freshBatch, repairBatch] = batchExecute.mock.calls
      .slice(1)
      .map((call) => renderSql(call[0] as SQL).sql);

>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    // The probe answers "does the maintenance walk still have work below the
    // horizon", so it has to select exactly the rows the batch would stamp.
    // Drop a predicate from the probe and it says true for rows no batch can
    // ever touch, which re-enqueues the walk on every sync forever; drop one
    // from the batch and the walk stamps rows the probe never counted. Both
    // sides are asserted so drift in either direction fails here.
    for (const text of [freshProbe, freshBatch]) {
      expect(text).toContain('s.media_id IS NULL');
      expect(text).toContain('s.rating_key IS NOT NULL');
<<<<<<< HEAD
      // The EXISTS guard is what keeps unresolvable rating keys and container
      // items from re-selecting forever. The batch repeats both predicates in
      // the UPDATE's own WHERE, so match inside the guard, not anywhere.
      const guard = guardBody(text);
      expect(guard).toMatch(/li2?\.media_id IS NOT NULL/);
      expect(guard).toMatch(/li2?\.media_type NOT IN \(\$\d+, \$\d+, \$\d+, \$\d+\)/);
=======
      // The EXISTS guard is what keeps unresolvable rating keys from re-selecting
      // forever. The batch also carries li.media_id IS NOT NULL in the UPDATE's
      // own WHERE, so match inside the EXISTS body, not anywhere in the query.
      const exists = /EXISTS\s*\(([\s\S]*?)\)/.exec(text ?? '')?.[1];
      expect(exists).toMatch(/li2?\.media_id IS NOT NULL/);
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    }

    for (const text of [repairProbe, repairBatch]) {
      expect(text).toContain('s.show_media_id IS NULL');
      expect(text).toContain('m.show_media_id IS NOT NULL');
    }
<<<<<<< HEAD

    for (const text of [unlinkProbe, unlinkBatch]) {
      expect(text).toMatch(/JOIN media m ON m\.id = s\.media_id\s+WHERE m\.media_type IN \(/);
    }
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  });
});

describe('runSessionIdentityBackfillWalk', () => {
  it('drains the uncompressed region, then each compressed chunk, then sweeps leftovers', async () => {
    const windows: Array<unknown> = [];
    const runBatch = vi.fn(async (_limit: number, window?: unknown) => {
      windows.push(window);
      return { updated: 0, oldest: null };
    });
    const ranges = [
      { start: new Date('2026-02-01T00:00:00Z'), end: new Date('2026-02-08T00:00:00Z') },
      { start: new Date('2026-01-25T00:00:00Z'), end: new Date('2026-02-01T00:00:00Z') },
    ];

    const result = await runSessionIdentityBackfillWalk({
      batchSize: 5000,
      getCompressedRanges: async () => ranges,
      runBatch,
    });

    expect(result).toEqual({ total: 0, earliest: null, failedRanges: [] });
    // Pass 1: from the horizon (newest compressed range_end). Pass 2: one window
    // per compressed chunk. Pass 3: unwindowed sweep.
    expect(windows).toEqual([
      { start: ranges[0]!.end },
      { start: ranges[0]!.start, end: ranges[0]!.end },
      { start: ranges[1]!.start, end: ranges[1]!.end },
      undefined,
    ]);
  });

  it('loops within a window until a batch comes back short, accumulating totals', async () => {
    const full = { updated: 3, oldest: new Date('2026-01-02T00:00:00Z') };
    const short = { updated: 1, oldest: new Date('2026-01-01T00:00:00Z') };
    const runBatch = vi.fn().mockResolvedValueOnce(full).mockResolvedValueOnce(short);

    const result = await runSessionIdentityBackfillWalk({
      batchSize: 3,
      getCompressedRanges: async () => [],
      runBatch,
    });

    expect(runBatch).toHaveBeenCalledTimes(2);
    expect(result.total).toBe(4);
    expect(result.earliest).toEqual(new Date('2026-01-01T00:00:00Z'));
  });

  it('bisects a failing chunk to day-level leaves, keeps going, and skips the final sweep', async () => {
    const chunk = {
      start: new Date('2026-02-01T00:00:00Z'),
      end: new Date('2026-02-08T00:00:00Z'),
    };
    const ranges = [
      chunk,
      { start: new Date('2026-01-25T00:00:00Z'), end: new Date('2026-02-01T00:00:00Z') },
    ];
    // Every sub-window of the first chunk fails, however narrow, so the walk
    // halves it all the way down before recording the leaves.
    const attemptedInChunk = new Set<string>();
    const runBatch = vi.fn(async (_limit: number, window?: { start?: Date; end?: Date }) => {
      const start = window?.start;
      const end = window?.end;
      if (start && end && start >= chunk.start && end <= chunk.end) {
        attemptedInChunk.add(`${start.toISOString()} → ${end.toISOString()}`);
        throw new Error('tuple decompression limit exceeded');
      }
      return { updated: 0, oldest: null };
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await runSessionIdentityBackfillWalk({
      batchSize: 5000,
      getCompressedRanges: async () => ranges,
      runBatch,
    });

    // Bisection happened: more than the one whole-chunk window was tried.
    expect(attemptedInChunk.size).toBeGreaterThan(1);
    expect(attemptedInChunk.has(`${chunk.start.toISOString()} → ${chunk.end.toISOString()}`)).toBe(
      true
    );

    // Only leaves are recorded, and every one of them sits inside the chunk.
    expect(result.failedRanges.length).toBeGreaterThan(0);
    expect(result.failedRanges).not.toContain(
      `${chunk.start.toISOString()} → ${chunk.end.toISOString()}`
    );
    for (const label of result.failedRanges) {
      const [from, to] = label.split(' → ');
      expect(new Date(from!).getTime()).toBeGreaterThanOrEqual(chunk.start.getTime());
      expect(new Date(to!).getTime()).toBeLessThanOrEqual(chunk.end.getTime());
    }

    // Second chunk still attempted; no unwindowed sweep after a failure.
    const calledWindows = runBatch.mock.calls.map((c) => c[1]);
    expect(calledWindows).toContainEqual({ start: ranges[1]!.start, end: ranges[1]!.end });
    expect(calledWindows).not.toContain(undefined);
    vi.restoreAllMocks();
  });

  it('aborts once enough ranges have failed to rule out per-chunk decompression', async () => {
    // 45 single-day chunks: a span of exactly DAY_MS can't be bisected, so each
    // chunk records one failure and the 40th trips the breaker.
    const ranges = Array.from({ length: 45 }, (_, i) => ({
      start: new Date(Date.UTC(2026, 0, i + 1)),
      end: new Date(Date.UTC(2026, 0, i + 2)),
    }));
    // A dead database fails every windowed batch. Pass 1 (start-only window)
    // still resolves so the walk gets as far as the chunk loop.
    const runBatch = vi.fn(async (_limit: number, window?: { start?: Date; end?: Date }) => {
      if (window?.start && window.end) throw new Error('ECONNREFUSED 127.0.0.1:5432');
      return { updated: 0, oldest: null };
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      runSessionIdentityBackfillWalk({
        batchSize: 5000,
        getCompressedRanges: async () => ranges,
        runBatch,
      })
    ).rejects.toThrow(/^Aborting walk: 40 failed ranges - this looks like a systemic fault/);

    // Pass 1 plus 40 chunk attempts - the remaining 5 chunks are never tried.
    expect(runBatch).toHaveBeenCalledTimes(41);
    vi.restoreAllMocks();
  });

  it('records a failing unwindowed sweep instead of discarding what the walk committed', async () => {
    const ranges = [
      { start: new Date('2026-02-01T00:00:00Z'), end: new Date('2026-02-08T00:00:00Z') },
    ];
    const runBatch = vi.fn(async (_limit: number, window?: { start?: Date; end?: Date }) => {
      // A chunk compressed mid-walk makes the sweep trip the decompression cap.
      if (!window) throw new Error('tuple decompression limit exceeded');
      return { updated: 2, oldest: new Date('2026-02-02T00:00:00Z') };
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await runSessionIdentityBackfillWalk({
      batchSize: 5000,
      getCompressedRanges: async () => ranges,
      runBatch,
    });

    expect(result.failedRanges).toEqual(['unwindowed sweep']);
    // Pass 1 and the chunk range both committed - their totals survive.
    expect(result.total).toBe(4);
    expect(result.earliest).toEqual(new Date('2026-02-02T00:00:00Z'));
    vi.restoreAllMocks();
  });

  it('aborts the whole walk when onBatch throws, instead of recording a failed range', async () => {
    const ranges = [
      { start: new Date('2026-02-01T00:00:00Z'), end: new Date('2026-02-08T00:00:00Z') },
    ];
    const runBatch = vi.fn().mockResolvedValue({ updated: 0, oldest: null });
    let batches = 0;

    // onBatch is where the maintenance job extends its BullMQ lock: a lost lock
    // must fail the walk, never be swallowed as one bad chunk range.
    await expect(
      runSessionIdentityBackfillWalk({
        batchSize: 5000,
        getCompressedRanges: async () => ranges,
        runBatch,
        onBatch: async () => {
          batches++;
          if (batches === 2) throw new Error('Lost lock for maintenance job 42');
        },
      })
    ).rejects.toThrow('Lost lock for maintenance job 42');

    // Pass 1, then the first chunk window - no bisection retries after the abort.
    expect(runBatch).toHaveBeenCalledTimes(2);
  });

  it('calls onBatch after every batch with the running total', async () => {
    const runBatch = vi
      .fn()
      .mockResolvedValueOnce({ updated: 3, oldest: new Date('2026-01-02T00:00:00Z') })
      .mockResolvedValueOnce({ updated: 1, oldest: new Date('2026-01-01T00:00:00Z') });
    const totals: number[] = [];

    await runSessionIdentityBackfillWalk({
      batchSize: 3,
      getCompressedRanges: async () => [],
      runBatch,
      onBatch: async (total) => {
        totals.push(total);
      },
    });

    expect(runBatch).toHaveBeenCalledTimes(2);
    expect(totals).toEqual([3, 4]);
  });

  it('skips the sweep when there are no compressed chunks (pass 1 already covered everything)', async () => {
    const runBatch = vi.fn().mockResolvedValue({ updated: 0, oldest: null });
    await runSessionIdentityBackfillWalk({
      batchSize: 5000,
      getCompressedRanges: async () => [],
      runBatch,
    });
    expect(runBatch).toHaveBeenCalledTimes(1);
    expect(runBatch).toHaveBeenCalledWith(5000, undefined);
  });
});

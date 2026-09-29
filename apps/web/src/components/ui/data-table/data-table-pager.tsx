import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { FLUSH_FOOTER_OFFSET, useDataTableChrome } from './data-table';
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import type { DataTablePagerState } from './use-data-table';

export interface DataTablePagerLabels {
  /** aria-label for the surrounding nav, e.g. "Pagination". */
  navigation: string;
  /** Already-interpolated status text, e.g. "Page 2 of 7". */
  status: string;
  previous: string;
  next: string;
<<<<<<< HEAD
  /** aria-label for a numbered button; `{{page}}` is substituted. */
  goToPage?: string;
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
}

interface DataTablePagerProps extends DataTablePagerState {
  labels: DataTablePagerLabels;
<<<<<<< HEAD
  /** `footer` matches a flush DataTableViewport's bleed; `plain` owns its own spacing. */
  variant?: 'plain' | 'footer';
  className?: string;
}

const GAP = 'gap' as const;
type PageSlot = number | typeof GAP;

export function pageSlots(page: number, pageCount: number): PageSlot[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const middle = [page - 1, page, page + 1].filter((n) => n > 1 && n < pageCount);
  const slots: PageSlot[] = [1];
  if ((middle[0] ?? pageCount) > 2) slots.push(GAP);
  slots.push(...middle);
  if ((middle[middle.length - 1] ?? 1) < pageCount - 1) slots.push(GAP);
  slots.push(pageCount);
  return slots;
}

export function DataTablePager({
  page,
=======
  className?: string;
}

export function DataTablePager({
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  pageCount,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
<<<<<<< HEAD
  onPage,
  labels,
  variant = 'plain',
  className,
}: DataTablePagerProps) {
  const { density } = useDataTableChrome();

=======
  labels,
  className,
}: DataTablePagerProps) {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label={labels.navigation}
<<<<<<< HEAD
      className={cn(
        'flex flex-wrap items-center gap-2',
        variant === 'footer' && [FLUSH_FOOTER_OFFSET[density], '-mb-6 border-t py-3'],
        className
      )}
    >
      <p className="text-muted-foreground flex-1 text-sm" aria-live="polite">
        {labels.status}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label={labels.previous}
        >
          <ChevronLeft />
          <span className="hidden sm:inline">{labels.previous}</span>
        </Button>
        {pageSlots(page, pageCount).map((slot, index) =>
          slot === GAP ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="text-muted-foreground w-6 text-center text-sm"
            >
              …
            </span>
          ) : (
            <Button
              key={slot}
              variant={slot === page ? 'secondary' : 'ghost'}
              size="sm"
              className="min-w-9 tabular-nums"
              aria-current={slot === page ? 'page' : undefined}
              aria-label={labels.goToPage?.replace('{{page}}', String(slot))}
              onClick={() => onPage(slot)}
            >
              {slot}
            </Button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          aria-label={labels.next}
        >
          <span className="hidden sm:inline">{labels.next}</span>
          <ChevronRight />
        </Button>
      </div>
      {/* Balances the status line so the controls sit centred rather than pinned right. */}
      <div className="hidden flex-1 sm:block" aria-hidden="true" />
=======
      className={cn('flex items-center justify-between', className)}
    >
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {labels.status}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={!canPrevious}>
          <ChevronLeft />
          {labels.previous}
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!canNext}>
          {labels.next}
          <ChevronRight />
        </Button>
      </div>
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    </nav>
  );
}

import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type Slot = number | 'gap';

function pageSlots(page: number, pageCount: number): Slot[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  const slots: Slot[] = [1];
  if (start > 2) slots.push('gap');
  for (let p = start; p <= end; p++) slots.push(p);
  if (end < pageCount - 1) slots.push('gap');
  slots.push(pageCount);
  return slots;
}

const navButton =
  'grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition ' +
  'hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40';

export function Pagination({ page, pageSize, total, onPageChange, className }: Props) {
  if (total <= pageSize) return null;

  const pageCount = Math.ceil(total / pageSize);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={clsx(
        'flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row',
        className,
      )}
    >
      <p className="tabular">
        Showing <span className="font-medium text-slate-900">{first}</span>–
        <span className="font-medium text-slate-900">{last}</span> of{' '}
        <span className="font-medium text-slate-900">{total}</span>
      </p>

      <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-start">
        <button
          type="button"
          className={navButton}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        <span className="tabular px-3 text-sm text-slate-600 sm:hidden">
          Page <span className="font-medium text-slate-900">{page}</span> of {pageCount}
        </span>

        {pageSlots(page, pageCount).map((slot, i) =>
          slot === 'gap' ? (
            <span key={`gap-${i}`} className="hidden size-9 place-items-center text-slate-400 sm:grid">
              …
            </span>
          ) : (
            <button
              key={slot}
              type="button"
              onClick={() => onPageChange(slot)}
              aria-current={slot === page ? 'page' : undefined}
              className={clsx(
                'tabular hidden size-9 place-items-center rounded-lg text-sm font-medium transition sm:grid',
                slot === page
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {slot}
            </button>
          ),
        )}

        <button
          type="button"
          className={navButton}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

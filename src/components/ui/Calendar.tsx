import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shiftMonth, today } from '../../lib/dates';
import { formatMonth } from '../../lib/format';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return toIso(new Date(y, m - 1, d + days));
}

function buildGrid(month: string) {
  const [y, m] = month.split('-').map(Number);
  const offset = new Date(y, m - 1, 1).getDay();
  return Array.from({ length: 42 }, (_, i) => {
    const iso = toIso(new Date(y, m - 1, 1 - offset + i));
    return { iso, day: Number(iso.slice(8)), inMonth: iso.startsWith(month) };
  });
}

interface CalendarProps {
  value?: string;
  onSelect: (iso: string) => void;
  min?: string;
  max?: string;
}

export function Calendar({ value, onSelect, min, max }: CalendarProps) {
  const todayIso = today();
  const [view, setView] = useState(() => (value || todayIso).slice(0, 7));
  const [focused, setFocused] = useState(value || todayIso);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(true);

  const cells = useMemo(() => buildGrid(view), [view]);
  const tabbable = cells.some((c) => c.iso === focused) ? focused : `${view}-01`;
  const isDisabled = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  const canPrev = !min || shiftMonth(view, -1) >= min.slice(0, 7);
  const canNext = !max || shiftMonth(view, 1) <= max.slice(0, 7);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused, view]);

  const moveFocus = (iso: string) => {
    shouldFocus.current = true;
    setFocused(iso);
    if (!iso.startsWith(view)) setView(iso.slice(0, 7));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in steps) {
      e.preventDefault();
      moveFocus(addDays(focused, steps[e.key]));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const month = shiftMonth(focused.slice(0, 7), e.key === 'PageUp' ? -1 : 1);
      const [y, m] = month.split('-').map(Number);
      const day = Math.min(Number(focused.slice(8)), new Date(y, m, 0).getDate());
      moveFocus(`${month}-${pad(day)}`);
    }
  };

  return (
    <div className="w-72 select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView((v) => shiftMonth(v, -1))}
          disabled={!canPrev}
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold text-slate-800" aria-live="polite">
          {formatMonth(view)}
        </p>
        <button
          type="button"
          onClick={() => setView((v) => shiftMonth(v, 1))}
          disabled={!canNext}
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium tracking-wide text-slate-400 uppercase">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1.5">
            {d}
          </span>
        ))}
      </div>

      <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-y-0.5" onKeyDown={onKeyDown}>
        {cells.map(({ iso, day, inMonth }) => {
          const selected = iso === value;
          const isToday = iso === todayIso;
          const disabled = isDisabled(iso);
          return (
            <button
              key={iso}
              type="button"
              data-date={iso}
              tabIndex={iso === tabbable ? 0 : -1}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              onFocus={() => setFocused(iso)}
              aria-pressed={selected}
              aria-label={iso}
              className={clsx(
                'relative mx-auto grid size-9 place-items-center rounded-lg text-sm transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500',
                selected
                  ? 'bg-brand-600 font-semibold text-white shadow-sm shadow-brand-600/30'
                  : disabled
                    ? 'cursor-not-allowed text-slate-300'
                    : inMonth
                      ? 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                      : 'text-slate-300 hover:bg-slate-50',
                isToday && !selected && 'font-semibold text-brand-600',
              )}
            >
              {day}
              {isToday && (
                <span
                  className={clsx(
                    'absolute bottom-1 size-1 rounded-full',
                    selected ? 'bg-white' : 'bg-brand-500',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

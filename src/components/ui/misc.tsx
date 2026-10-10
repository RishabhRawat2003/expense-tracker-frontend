import { useCallback, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatMonth } from '../../lib/format';
import { currentMonth, shiftMonth } from '../../lib/dates';
import { Popover } from './Popover';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center py-12', className)}>
      <Loader2 className="size-6 animate-spin text-brand-600" aria-label="Loading" />
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center px-4 py-12 text-center', className)}>
      {icon && (
        <div className="mb-3 grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
          {icon}
        </div>
      )}
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: over ? '#ef4444' : (color ?? '#6366f1'),
        }}
      />
    </div>
  );
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)));
  const anchorRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const thisMonth = currentMonth();

  const toggle = () => {
    if (!open) setYear(Number(value.slice(0, 4)));
    setOpen((o) => !o);
  };

  return (
    <div
      className={clsx(
        'inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white shadow-sm sm:h-10',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="grid h-full w-10 shrink-0 place-items-center sm:w-9 rounded-l-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        ref={anchorRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={clsx(
          'flex h-full min-w-36 flex-1 items-center justify-center gap-2 border-x border-slate-200 px-3 text-sm font-medium transition-colors',
          open ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50',
        )}
      >
        <CalendarDays className="size-4 text-slate-400" />
        {formatMonth(value)}
      </button>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="grid h-full w-10 shrink-0 place-items-center sm:w-9 rounded-r-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </button>

      <Popover open={open} onClose={close} anchorRef={anchorRef} align="end" label="Choose month">
        <div className="w-64">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Previous year"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold text-slate-800">{year}</p>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Next year"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_NAMES.map((name, i) => {
              const month = `${year}-${String(i + 1).padStart(2, '0')}`;
              const selected = month === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(month);
                    setOpen(false);
                  }}
                  aria-pressed={selected}
                  className={clsx(
                    'rounded-lg py-2 text-sm transition-colors',
                    selected
                      ? 'bg-brand-600 font-semibold text-white shadow-sm shadow-brand-600/30'
                      : month === thisMonth
                        ? 'font-semibold text-brand-600 hover:bg-brand-50'
                        : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
          {value !== thisMonth && (
            <div className="mt-3 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(thisMonth);
                  setOpen(false);
                }}
                className="w-full rounded-md py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Jump to this month
              </button>
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CategoryDot({ color }: { color: string }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

export function CategoryAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold"
      style={{ backgroundColor: `${color}1f`, color }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

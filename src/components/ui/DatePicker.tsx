import { useCallback, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { CalendarDays, X } from 'lucide-react';
import { today } from '../../lib/dates';
import { formatLongDate } from '../../lib/format';
import { Calendar } from './Calendar';
import { controlClass, FieldShell, type FieldProps } from './Field';
import { Popover } from './Popover';

interface DatePickerProps extends FieldProps {
  value?: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  label,
  error,
  hint,
  placeholder = 'Pick a date',
  min,
  max,
  clearable,
  id,
}: DatePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  const select = (iso: string) => {
    onChange(iso);
    close();
    anchorRef.current?.focus();
  };

  const todayIso = today();
  const todayAllowed = (!min || todayIso >= min) && (!max || todayIso <= max);

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <div className="relative">
        <button
          ref={anchorRef}
          id={inputId}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={!!error}
          className={clsx(
            controlClass,
            'flex items-center gap-2.5 text-left',
            clearable && value && 'pr-9',
            error ? 'border-red-400' : open ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-300',
          )}
        >
          <CalendarDays className={clsx('size-4 shrink-0', open ? 'text-brand-600' : 'text-slate-400')} />
          <span className={clsx('flex-1 truncate', !value && 'text-slate-400')}>
            {value ? formatLongDate(value) : placeholder}
          </span>
        </button>
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label="Clear date"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Popover open={open} onClose={close} anchorRef={anchorRef} label={label ?? 'Choose date'}>
        <Calendar value={value} onSelect={select} min={min} max={max} />
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => select(todayIso)}
            disabled={!todayAllowed}
            className="rounded-md px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-40"
          >
            Today
          </button>
          {clearable && value && (
            <button
              type="button"
              onClick={() => select('')}
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </Popover>
    </FieldShell>
  );
}

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export const controlClass =
  'block w-full rounded-lg border bg-white px-3 h-11 sm:h-10 text-base sm:text-sm text-slate-900 shadow-sm transition ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: ReactNode;
}

export function FieldShell({ id, label, error, hint, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function Input({ label, error, hint, className, id, ...rest }: FieldProps & ComponentProps<'input'>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={clsx(controlClass, error ? 'border-red-400' : 'border-slate-300', className)}
        {...rest}
      />
    </FieldShell>
  );
}

const sanitizeAmount = (raw: string) => {
  const [whole, ...fraction] = raw.replace(/[^\d.]/g, '').split('.');
  return fraction.length ? `${whole}.${fraction.join('').slice(0, 2)}` : whole;
};

export function AmountInput({
  label,
  error,
  hint,
  className,
  id,
  onChange,
  ...rest
}: FieldProps & Omit<ComponentProps<'input'>, 'type'>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-lg font-medium text-slate-400">
          ₹
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={clsx(
            controlClass,
            'h-12! pl-10 text-xl! font-semibold tracking-tight placeholder:font-normal',
            error ? 'border-red-400' : 'border-slate-300',
            className,
          )}
          onChange={(e) => {
            const clean = sanitizeAmount(e.target.value);
            if (clean !== e.target.value) e.target.value = clean;
            onChange?.(e);
          }}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function PasswordInput({
  label,
  error,
  hint,
  className,
  id,
  ...rest
}: FieldProps & Omit<ComponentProps<'input'>, 'type'>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={clsx(controlClass, 'pr-11', error ? 'border-red-400' : 'border-slate-300', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600 focus-visible:text-brand-600 focus-visible:outline-none"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <Icon className="size-4.5" />
        </button>
      </div>
    </FieldShell>
  );
}

export function Select({ label, error, hint, className, id, children, ...rest }: FieldProps & ComponentProps<'select'>) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint}>
      <select
        id={selectId}
        aria-invalid={!!error}
        className={clsx(controlClass, 'pr-8', error ? 'border-red-400' : 'border-slate-300', className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Card } from './misc';

type Accent = 'brand' | 'emerald' | 'amber' | 'rose' | 'sky';

interface Props {
  label: string;
  value: string;
  icon: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  accent?: Accent;
  children?: ReactNode;
}

const accents: Record<Accent, string> = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
};

export function StatCard({ label, value, icon, footer, tone = 'default', accent = 'brand', children }: Props) {
  return (
    <Card className="flex flex-col p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-center gap-3">
        <span className={clsx('grid size-9 shrink-0 place-items-center rounded-lg', accents[accent])}>{icon}</span>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p
        className={clsx(
          'tabular mt-3 truncate text-xl font-bold tracking-tight sm:text-2xl',
          tone === 'negative' ? 'text-rose-600' : tone === 'positive' ? 'text-emerald-600' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      {children}
      {footer && <div className="mt-auto pt-2 text-xs text-slate-500">{footer}</div>}
    </Card>
  );
}

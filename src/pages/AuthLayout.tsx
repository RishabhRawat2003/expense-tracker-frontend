import type { ReactNode } from 'react';
import { Brand } from '../components/layout/AppLayout';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-start justify-center bg-linear-to-br from-brand-50 via-white to-slate-100 px-4 pt-12 pb-10 sm:items-center sm:py-10">
      <div className="w-full max-w-sm sm:max-w-md">
        <Brand className="mb-6 justify-center sm:mb-8" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
          <p className="mt-1 mb-5 text-sm text-slate-500 sm:mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

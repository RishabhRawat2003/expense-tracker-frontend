import { Suspense, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { BarChart3, LayoutDashboard, LogOut, PiggyBank, ReceiptText, Wallet } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Spinner } from '../ui/misc';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const askSignOut = () => setConfirmingSignOut(true);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch {
      setSigningOut(false);
      setConfirmingSignOut(false);
    }
  };

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <Brand className="px-5 py-5" />
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="size-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={askSignOut}
            className="mt-3 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <button onClick={askSignOut} className="p-1 text-slate-500" aria-label="Sign out">
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="flex-1 px-4 pt-5 pb-24 sm:px-6 md:pb-10 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                isActive ? 'text-brand-600' : 'text-slate-500',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <ConfirmDialog
        open={confirmingSignOut}
        title="Sign out?"
        message="You'll need to sign in again to access your expenses and budgets."
        confirmLabel="Sign out"
        icon={<LogOut className="size-5" />}
        loading={signingOut}
        onConfirm={signOut}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </div>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
        <Wallet className="size-4.5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">Spendwise</span>
    </div>
  );
}

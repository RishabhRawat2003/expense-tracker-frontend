import { Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChartPie,
  LineChart,
  PiggyBank,
  Plus,
  ReceiptText,
  Target,
  Wallet,
} from 'lucide-react';
import { CategoryPieChart, TrendChart } from '../components/charts';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import {
  Card,
  CategoryAvatar,
  CategoryDot,
  EmptyState,
  MonthPicker,
  ProgressBar,
  SectionHeader,
  Spinner,
} from '../components/ui/misc';
import { ExpenseFormModal } from '../features/expenses/ExpenseFormModal';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/queries';
import { currentMonth } from '../lib/dates';
import { formatCurrency, formatDate, formatMonth, percentOf } from '../lib/format';
import type { Dashboard } from '../types/api';

const dayOfMonth = (iso: string) => String(Number(iso.slice(8, 10)));

function daysElapsedIn(month: string, daysInMonth: number) {
  return month === currentMonth() ? new Date().getDate() : daysInMonth;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth);
  const [adding, setAdding] = useState(false);
  const { data, isPending, isError } = useDashboard(month);

  const firstName = user?.name.split(' ')[0];
  const openAdd = () => setAdding(true);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">{greeting()}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Your spending overview for {formatMonth(month)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} className="w-full sm:w-auto" />
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus className="size-4" /> Add expense
          </Button>
        </div>
      </div>

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={<AlertTriangle className="size-5" />}
            title="Couldn't load your dashboard"
            description="Please refresh the page to try again."
          />
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <Overview data={data} />

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <SpendingTrend data={data} month={month} onAdd={openAdd} />
            <CategoryBreakdown data={data} />
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            <BudgetProgress data={data} />
            <RecentExpenses data={data} onAdd={openAdd} />
          </div>
        </div>
      )}

      <ExpenseFormModal open={adding} expense={null} onClose={() => setAdding(false)} />
    </>
  );
}

function Overview({ data }: { data: Dashboard }) {
  const used = percentOf(data.totalSpent, data.totalBudget);
  const hasBudget = data.totalBudget > 0;
  const overspent = hasBudget && data.remainingBudget < 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
      <StatCard
        label="Total spent"
        value={formatCurrency(data.totalSpent)}
        icon={<Wallet className="size-5" />}
        accent="brand"
        footer={<MonthChange current={data.totalSpent} previous={data.previousMonthSpent} />}
      />

      <StatCard
        label="Monthly budget"
        value={formatCurrency(data.totalBudget)}
        icon={<PiggyBank className="size-5" />}
        accent="sky"
        footer={hasBudget ? `${used}% of budget used` : 'No budgets set for this month'}
      >
        {hasBudget && (
          <div className="mt-3">
            <ProgressBar value={data.totalSpent} max={data.totalBudget} />
          </div>
        )}
      </StatCard>

      <StatCard
        label="Remaining"
        value={formatCurrency(hasBudget ? data.remainingBudget : 0)}
        tone={!hasBudget ? 'default' : overspent ? 'negative' : 'positive'}
        icon={<Target className="size-5" />}
        accent={overspent ? 'rose' : 'emerald'}
        footer={!hasBudget ? 'Set a budget to track this' : overspent ? 'You are over budget' : 'Left to spend this month'}
      />

      <StatCard
        label="Over budget"
        value={String(data.overBudgetCount)}
        tone={data.overBudgetCount ? 'negative' : 'default'}
        icon={data.overBudgetCount ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
        accent={data.overBudgetCount ? 'rose' : 'amber'}
        footer={
          data.overBudgetCount
            ? `${data.overBudgetCount === 1 ? 'category has' : 'categories have'} exceeded the limit`
            : 'All categories within limits'
        }
      />
    </div>
  );
}

function SpendingTrend({ data, month, onAdd }: { data: Dashboard; month: string; onAdd: () => void }) {
  const stats = useMemo(() => {
    const daysElapsed = daysElapsedIn(month, data.daily.length);
    const peak = data.daily.reduce((max, d) => (d.total > max.total ? d : max), data.daily[0] ?? { label: '', total: 0 });
    return { average: data.totalSpent / Math.max(daysElapsed, 1), peak };
  }, [data, month]);

  return (
    <Card className="p-4 sm:p-5 lg:col-span-2">
      <SectionHeader
        title="Daily spending"
        subtitle={data.totalSpent > 0 ? 'How your spending is spread across the month' : undefined}
        action={
          data.totalSpent > 0 && (
            <div className="flex shrink-0 gap-4 text-right">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">Avg / day</p>
                <p className="tabular text-sm font-semibold text-slate-800">{formatCurrency(stats.average)}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">Peak</p>
                <p className="tabular text-sm font-semibold text-slate-800">{formatCurrency(stats.peak.total)}</p>
              </div>
            </div>
          )
        }
      />
      {data.totalSpent > 0 ? (
        <Suspense fallback={<Spinner className="h-64" />}>
          <TrendChart data={data.daily} formatLabel={dayOfMonth} variant="area" />
        </Suspense>
      ) : (
        <EmptyState
          className="h-64"
          icon={<LineChart className="size-5" />}
          title={`No spending in ${formatMonth(month)}`}
          description="Your daily spending trend will appear here once you add expenses."
          action={
            <Button size="sm" onClick={onAdd}>
              <Plus className="size-4" /> Add expense
            </Button>
          }
        />
      )}
    </Card>
  );
}

function CategoryBreakdown({ data }: { data: Dashboard }) {
  const slices = useMemo(() => data.categories.filter((c) => c.spent > 0), [data]);

  return (
    <Card className="p-4 sm:p-5">
      <SectionHeader title="By category" subtitle={slices.length ? `${slices.length} categories this month` : undefined} />
      {slices.length === 0 ? (
        <EmptyState
          className="h-64"
          icon={<ChartPie className="size-5" />}
          title="Nothing spent yet"
          description="See where your money goes, by category."
        />
      ) : (
        <>
          <div className="relative">
            <Suspense fallback={<Spinner className="h-52" />}>
              <CategoryPieChart data={slices} height={200} />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-slate-400">Total</p>
              <p className="tabular text-base font-bold text-slate-900">{formatCurrency(data.totalSpent)}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {slices.slice(0, 4).map((c) => (
              <li key={c.categoryId} className="flex items-center gap-2 text-sm">
                <CategoryDot color={c.color} />
                <span className="flex-1 truncate text-slate-600">{c.name}</span>
                <span className="tabular font-medium text-slate-800">{percentOf(c.spent, data.totalSpent)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function BudgetProgress({ data }: { data: Dashboard }) {
  const rows = useMemo(
    () =>
      data.categories
        .filter((c) => c.spent > 0 || c.budget > 0)
        .sort((a, b) => percentOf(b.spent, b.budget || Infinity) - percentOf(a.spent, a.budget || Infinity)),
    [data],
  );

  return (
    <Card className="p-4 sm:p-5">
      <SectionHeader
        title="Budget progress"
        subtitle="Spending against this month's limits"
        action={
          <Link to="/budgets" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            Manage <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="size-5" />}
          title="No activity this month"
          description="Set monthly limits to keep your spending in check."
          action={
            <Link
              to="/budgets"
              className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Set a budget
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((c) => {
            const pct = percentOf(c.spent, c.budget);
            return (
              <li key={c.categoryId}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
                    <CategoryDot color={c.color} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="tabular shrink-0 text-slate-500">
                    <span className="font-semibold text-slate-900">{formatCurrency(c.spent)}</span>
                    {c.budget > 0 && <> / {formatCurrency(c.budget)}</>}
                  </span>
                </div>
                {c.budget > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar value={c.spent} max={c.budget} color={c.color} />
                    </div>
                    <span
                      className={clsx(
                        'tabular w-10 text-right text-xs font-medium',
                        pct > 100 ? 'text-rose-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-500',
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No budget set</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function RecentExpenses({ data, onAdd }: { data: Dashboard; onAdd: () => void }) {
  return (
    <Card className="p-4 sm:p-5">
      <SectionHeader
        title="Recent expenses"
        subtitle="Your latest transactions"
        action={
          <Link to="/expenses" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            View all <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      {data.recent.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-5" />}
          title="No expenses yet"
          description="Start by adding what you spent today."
          action={
            <Button size="sm" onClick={onAdd}>
              <Plus className="size-4" /> Add expense
            </Button>
          }
        />
      ) : (
        <ul className="-mx-2">
          {data.recent.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50">
              <CategoryAvatar name={e.categoryName} color={e.categoryColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{e.description || e.categoryName}</p>
                <p className="text-xs text-slate-500">
                  {e.categoryName} · {formatDate(e.spentOn)}
                </p>
              </div>
              <span className="tabular text-sm font-semibold text-slate-900">−{formatCurrency(e.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MonthChange({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <>No spending last month to compare</>;
  }
  const change = Math.round(((current - previous) / previous) * 100);
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium',
        up ? 'text-rose-600' : 'text-emerald-600',
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(change)}% {up ? 'more' : 'less'} than last month
    </span>
  );
}

import { Suspense, useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Download, PiggyBank, ReceiptText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '../api';
import { CategoryPieChart, TrendChart } from '../components/charts';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { StatCard } from '../components/ui/StatCard';
import {
  Card,
  CategoryAvatar,
  CategoryDot,
  EmptyState,
  MonthPicker,
  PageHeader,
  ProgressBar,
  Spinner,
} from '../components/ui/misc';
import { useReport } from '../hooks/queries';
import { usePagination } from '../hooks/usePagination';
import { currentMonth } from '../lib/dates';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency, formatMonth, formatShortMonth, percentOf } from '../lib/format';
import type { ReportParams } from '../types/api';

type Period = ReportParams['period'];

const ROWS_PER_PAGE = 10;

const dayOfMonth = (iso: string) => String(Number(iso.slice(8, 10)));

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);

  const params = useMemo<ReportParams>(
    () => (period === 'monthly' ? { period, month } : { period, year }),
    [period, month, year],
  );
  const { data: report, isPending, isFetching } = useReport(params);
  const rows = useMemo(() => report?.categories.filter((c) => c.spent > 0 || c.budget > 0) ?? [], [report]);
  const pagination = usePagination(rows, ROWS_PER_PAGE, period === 'monthly' ? month : year);

  const download = async () => {
    setDownloading(true);
    try {
      const { blob, filename } = await reportsApi.exportCsv(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Export failed'));
    } finally {
      setDownloading(false);
    }
  };

  const title = period === 'monthly' ? formatMonth(month) : String(year);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`Spending report for ${title}`}
        actions={
          <>
            <div
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm sm:inline-flex sm:h-10 sm:w-auto"
              role="tablist"
            >
              {(['monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={period === p}
                  onClick={() => setPeriod(p)}
                  className={clsx(
                    'flex-1 rounded-md px-3 text-sm font-medium capitalize transition-colors',
                    period === p ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {period === 'monthly' ? (
              <MonthPicker value={month} onChange={setMonth} className="flex-1 sm:flex-none" />
            ) : (
              <YearPicker value={year} onChange={setYear} />
            )}
            <Button variant="secondary" onClick={download} loading={downloading} aria-label="Export CSV">
              {!downloading && <Download className="size-4" />}
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </>
        }
      />

      {isPending ? (
        <Spinner />
      ) : !report ? null : (
        <div className={clsx('space-y-4', isFetching && 'opacity-70 transition-opacity')}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total spent" value={formatCurrency(report.totalSpent)} icon={<Wallet className="size-5" />} />
            <StatCard
              label="Total budget"
              value={formatCurrency(report.totalBudget)}
              icon={<PiggyBank className="size-5" />}
              footer={report.totalBudget ? `${percentOf(report.totalSpent, report.totalBudget)}% used` : undefined}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <StatCard
                label="Transactions"
                value={String(report.expenseCount)}
                icon={<ReceiptText className="size-5" />}
                footer={
                  report.expenseCount
                    ? `Avg ${formatCurrency(report.totalSpent / report.expenseCount)} per expense`
                    : undefined
                }
              />
            </div>
          </div>

          {report.expenseCount === 0 ? (
            <Card>
              <EmptyState title={`No expenses in ${title}`} description="Pick another period or add some expenses." />
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="p-4 sm:p-5 lg:col-span-2">
                  <h2 className="mb-4 font-medium text-slate-800">
                    {period === 'monthly' ? 'Spending by day' : 'Spending by month'}
                  </h2>
                  <Suspense fallback={<Spinner className="h-64" />}>
                    <TrendChart data={report.trend} formatLabel={period === 'monthly' ? dayOfMonth : formatShortMonth} />
                  </Suspense>
                </Card>
                <Card className="p-4 sm:p-5">
                  <h2 className="mb-2 font-medium text-slate-800">Category split</h2>
                  <Suspense fallback={<Spinner className="h-60" />}>
                    <CategoryPieChart data={report.categories} />
                  </Suspense>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h2 className="font-medium text-slate-800">Category breakdown</h2>
                  <span className="text-xs text-slate-500">{rows.length} categories</span>
                </div>

                <ul className="divide-y divide-slate-100 sm:hidden">
                  {pagination.pageItems.map((c) => {
                    const remaining = c.budget - c.spent;
                    return (
                      <li key={c.categoryId} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CategoryAvatar name={c.name} color={c.color} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-500">{percentOf(c.spent, report.totalSpent)}% of spending</p>
                          </div>
                          <p className="tabular text-sm font-semibold text-slate-900">{formatCurrency(c.spent)}</p>
                        </div>
                        {c.budget > 0 && (
                          <div className="mt-2.5 pl-12">
                            <ProgressBar value={c.spent} max={c.budget} color={c.color} />
                            <div className="tabular mt-1.5 flex justify-between text-xs text-slate-500">
                              <span>Budget {formatCurrency(c.budget)}</span>
                              <span className={remaining < 0 ? 'font-medium text-red-600' : undefined}>
                                {remaining < 0 ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} left`}
                              </span>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <table className="hidden w-full text-sm sm:table">
                  <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Spent</th>
                      <th className="px-4 py-3 text-right font-medium">Budget</th>
                      <th className="px-4 py-3 text-right font-medium">Remaining</th>
                      <th className="px-4 py-3 text-right font-medium">Share</th>
                    </tr>
                  </thead>
                  <tbody className="tabular divide-y divide-slate-100">
                    {pagination.pageItems.map((c) => {
                      const remaining = c.budget - c.spent;
                      return (
                        <tr key={c.categoryId}>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2 text-slate-700">
                              <CategoryDot color={c.color} />
                              {c.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(c.spent)}</td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {c.budget ? formatCurrency(c.budget) : '—'}
                          </td>
                          <td className={clsx('px-4 py-3 text-right', c.budget && remaining < 0 ? 'text-red-600' : 'text-slate-600')}>
                            {c.budget ? formatCurrency(remaining) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{percentOf(c.spent, report.totalSpent)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={pagination.setPage}
                />
              </Card>
            </>
          )}
        </div>
      )}
    </>
  );
}

function YearPicker({ value, onChange }: { value: number; onChange: (year: number) => void }) {
  return (
    <div className="flex h-11 flex-1 items-center rounded-lg border border-slate-300 bg-white shadow-sm sm:inline-flex sm:h-10 sm:flex-none">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid h-full w-10 place-items-center text-slate-500 hover:text-slate-800 sm:w-9"
        aria-label="Previous year"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-16 flex-1 text-center text-sm font-medium text-slate-700">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-full w-10 place-items-center text-slate-500 hover:text-slate-800 sm:w-9"
        aria-label="Next year"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

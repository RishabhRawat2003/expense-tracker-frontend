import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { Card, CategoryDot, EmptyState, MonthPicker, PageHeader, ProgressBar, Spinner } from '../components/ui/misc';
import { BudgetFormModal } from '../features/budgets/BudgetFormModal';
import { useBudgets, useCopyBudgets, useDeleteBudget } from '../hooks/queries';
import { usePagination } from '../hooks/usePagination';
import { currentMonth, shiftMonth } from '../lib/dates';
import { formatCurrency, formatMonth, percentOf } from '../lib/format';
import type { Budget } from '../types/api';

const BUDGETS_PER_PAGE = 9;
const EMPTY: Budget[] = [];

type FormState = { open: false } | { open: true; budget: Budget | null };

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const { data: budgets, isPending } = useBudgets(month);
  const deleteBudget = useDeleteBudget();
  const copyBudgets = useCopyBudgets();

  const [form, setForm] = useState<FormState>({ open: false });
  const [toDelete, setToDelete] = useState<Budget | null>(null);

  const usedCategoryIds = useMemo(() => new Set(budgets?.map((b) => b.categoryId)), [budgets]);
  const totals = useMemo(
    () =>
      (budgets ?? []).reduce(
        (acc, b) => ({ limit: acc.limit + b.amount, spent: acc.spent + b.spent }),
        { limit: 0, spent: 0 },
      ),
    [budgets],
  );

  const pagination = usePagination(budgets ?? EMPTY, BUDGETS_PER_PAGE, month);
  const prevMonth = shiftMonth(month, -1);

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Set monthly spending limits per category."
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} className="w-full sm:w-auto" />
            <Button onClick={() => setForm({ open: true, budget: null })} className="w-full sm:w-auto">
              <Plus className="size-4" /> New budget
            </Button>
          </>
        }
      />

      {budgets && budgets.length > 0 && (
        <Card className="mb-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500">Spent of total budget</p>
              <p className="tabular mt-1 text-2xl font-semibold text-slate-900">
                {formatCurrency(totals.spent)}{' '}
                <span className="text-base font-normal text-slate-400">/ {formatCurrency(totals.limit)}</span>
              </p>
            </div>
            <p className={clsx('text-sm font-medium', totals.spent > totals.limit ? 'text-red-600' : 'text-emerald-600')}>
              {totals.spent > totals.limit
                ? `${formatCurrency(totals.spent - totals.limit)} over`
                : `${formatCurrency(totals.limit - totals.spent)} left`}
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar value={totals.spent} max={totals.limit} />
          </div>
        </Card>
      )}

      {isPending ? (
        <Spinner />
      ) : !budgets?.length ? (
        <Card>
          <EmptyState
            title={`No budgets for ${formatMonth(month)}`}
            description="Create a budget for a category, or reuse last month's limits."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="secondary"
                  loading={copyBudgets.isPending}
                  onClick={() => copyBudgets.mutate({ from: prevMonth, to: month })}
                >
                  <Copy className="size-4" /> Copy from {formatMonth(prevMonth)}
                </Button>
                <Button onClick={() => setForm({ open: true, budget: null })}>
                  <Plus className="size-4" /> New budget
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pagination.pageItems.map((b) => (
              <BudgetCard key={b.id} budget={b} onEdit={() => setForm({ open: true, budget: b })} onDelete={() => setToDelete(b)} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.setPage}
            className="mt-4 border-t-0 px-0"
          />
        </>
      )}

      <BudgetFormModal
        open={form.open}
        month={month}
        budget={form.open ? form.budget : null}
        usedCategoryIds={usedCategoryIds}
        onClose={() => setForm({ open: false })}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Remove budget?"
        message={toDelete && `The ${toDelete.categoryName} budget for ${formatMonth(toDelete.month)} will be removed. Expenses are not affected.`}
        confirmLabel="Remove"
        loading={deleteBudget.isPending}
        onConfirm={() => toDelete && deleteBudget.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

function BudgetCard({ budget, onEdit, onDelete }: { budget: Budget; onEdit: () => void; onDelete: () => void }) {
  const pct = percentOf(budget.spent, budget.amount);
  const remaining = budget.amount - budget.spent;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryDot color={budget.categoryColor} />
          <p className="truncate font-medium text-slate-800">{budget.categoryName}</p>
        </div>
        <div className="-mt-1 -mr-1 flex shrink-0">
          <button onClick={onEdit} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Edit budget">
            <Pencil className="size-4" />
          </button>
          <button onClick={onDelete} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete budget">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <p className="tabular mt-3 text-sm text-slate-600">
        <span className="text-lg font-semibold text-slate-900">{formatCurrency(budget.spent)}</span> of{' '}
        {formatCurrency(budget.amount)}
      </p>
      <div className="mt-2">
        <ProgressBar value={budget.spent} max={budget.amount} color={budget.categoryColor} />
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className={clsx(pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-500')}>{pct}% used</span>
        <span className={remaining < 0 ? 'font-medium text-red-600' : 'text-slate-500'}>
          {remaining < 0 ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} left`}
        </span>
      </div>
    </Card>
  );
}

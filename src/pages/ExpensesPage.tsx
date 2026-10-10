import { useCallback, useEffect, useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { Card, EmptyState, PageHeader, Spinner } from '../components/ui/misc';
import { CategoryManagerModal } from '../features/expenses/CategoryManagerModal';
import { ExpenseFiltersBar } from '../features/expenses/ExpenseFiltersBar';
import { ExpenseFormModal } from '../features/expenses/ExpenseFormModal';
import { ExpenseList } from '../features/expenses/ExpenseList';
import { useExpenseFilters } from '../features/expenses/useExpenseFilters';
import { useDeleteExpense, useExpenses } from '../hooks/queries';
import { formatCurrency } from '../lib/format';
import type { Expense } from '../types/api';

type FormState = { open: false } | { open: true; expense: Expense | null };

export default function ExpensesPage() {
  const { filters, update, reset, activeCount } = useExpenseFilters();
  const { data, isPending, isFetching, isError, refetch } = useExpenses(filters);
  const deleteExpense = useDeleteExpense();

  const [form, setForm] = useState<FormState>({ open: false });
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (data && data.items.length === 0 && data.page > 1) update({ page: data.page - 1 });
  }, [data, update]);

  const openEdit = useCallback((expense: Expense) => setForm({ open: true, expense }), []);
  const closeForm = useCallback(() => setForm({ open: false }), []);

  const handleSort = useCallback(
    (sortBy: 'date' | 'amount') => {
      const order = filters.sortBy === sortBy && filters.order === 'desc' ? 'asc' : 'desc';
      update({ sortBy, order });
    },
    [filters.sortBy, filters.order, update],
  );

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteExpense.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={data ? `${data.total} expense${data.total === 1 ? '' : 's'} · ${formatCurrency(data.totalAmount)}` : undefined}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowCategories(true)} className="flex-1 sm:flex-none">
              <Tags className="size-4" /> Categories
            </Button>
            <Button onClick={() => setForm({ open: true, expense: null })} className="flex-1 sm:flex-none">
              <Plus className="size-4" /> Add expense
            </Button>
          </>
        }
      />

      <ExpenseFiltersBar filters={filters} activeCount={activeCount} onChange={update} onReset={reset} />

      <Card className="mt-4 overflow-hidden">
        {isPending ? (
          <Spinner />
        ) : isError ? (
          <EmptyState
            title="Couldn't load expenses"
            action={<Button variant="secondary" onClick={() => refetch()}>Try again</Button>}
          />
        ) : data.items.length === 0 ? (
          <EmptyState
            title={activeCount ? 'No expenses match your filters' : 'No expenses yet'}
            description={activeCount ? 'Try widening the date range or clearing filters.' : 'Add your first expense to get started.'}
            action={
              activeCount ? (
                <Button variant="secondary" onClick={reset}>Clear filters</Button>
              ) : (
                <Button onClick={() => setForm({ open: true, expense: null })}>Add expense</Button>
              )
            }
          />
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
            <ExpenseList
              expenses={data.items}
              sortBy={filters.sortBy}
              order={filters.order}
              onSort={handleSort}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={(page) => update({ page })}
            />
          </div>
        )}
      </Card>

      <ExpenseFormModal open={form.open} expense={form.open ? form.expense : null} onClose={closeForm} />
      <CategoryManagerModal open={showCategories} onClose={() => setShowCategories(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete expense?"
        message={
          toDelete && (
            <>
              <strong>{formatCurrency(toDelete.amount)}</strong>
              {toDelete.description ? ` for "${toDelete.description}"` : ''} will be permanently removed.
            </>
          )
        }
        loading={deleteExpense.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

import { memo } from 'react';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { CategoryAvatar, CategoryDot } from '../../components/ui/misc';
import { formatCurrency, formatDate } from '../../lib/format';
import type { Expense, ExpenseFilters } from '../../types/api';

interface Props {
  expenses: Expense[];
  sortBy: ExpenseFilters['sortBy'];
  order: ExpenseFilters['order'];
  onSort: (sortBy: 'date' | 'amount') => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseList = memo(function ExpenseList({ expenses, sortBy, order, onSort, onEdit, onDelete }: Props) {
  const SortIcon = order === 'asc' ? ArrowUp : ArrowDown;
  const sortHeader = (key: 'date' | 'amount', label: string, align = 'text-left') => (
    <th className={`px-4 py-3 font-medium ${align}`}>
      <button onClick={() => onSort(key)} className="inline-flex items-center gap-1 hover:text-slate-900">
        {label}
        {sortBy === key && <SortIcon className="size-3.5" />}
      </button>
    </th>
  );

  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            {sortHeader('date', 'Date')}
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            {sortHeader('amount', 'Amount', 'text-right')}
            <th className="w-24 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((e) => (
            <tr key={e.id} className="group hover:bg-slate-50">
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(e.spentOn)}</td>
              <td className="max-w-xs truncate px-4 py-3 text-slate-800">
                {e.description || <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <CategoryDot color={e.categoryColor} />
                  {e.categoryName}
                </span>
              </td>
              <td className="tabular px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(e.amount)}</td>
              <td className="px-4 py-3">
                <RowActions expense={e} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-500 md:hidden">
        <span>Sort by</span>
        {(['date', 'amount'] as const).map((key) => (
          <button
            key={key}
            onClick={() => onSort(key)}
            aria-pressed={sortBy === key}
            className={clsx(
              'inline-flex h-8 items-center gap-1 rounded-full border px-3 font-medium capitalize transition-colors',
              sortBy === key
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
          >
            {key}
            {sortBy === key && <SortIcon className="size-3.5" />}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {expenses.map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-3 pr-2 pl-4">
            <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => onEdit(e)}>
              <CategoryAvatar name={e.categoryName} color={e.categoryColor} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{e.description || e.categoryName}</span>
                <span className="block truncate text-xs text-slate-500">
                  {e.categoryName} · {formatDate(e.spentOn)}
                </span>
              </span>
              <span className="tabular shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(e.amount)}</span>
            </button>
            <button
              onClick={() => onDelete(e)}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${e.description || 'expense'}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
});

function RowActions({ expense, onEdit, onDelete }: { expense: Expense } & Pick<Props, 'onEdit' | 'onDelete'>) {
  return (
    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100">
      <button
        onClick={() => onEdit(expense)}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
        aria-label="Edit expense"
      >
        <Pencil className="size-4" />
      </button>
      <button
        onClick={() => onDelete(expense)}
        className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete expense"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

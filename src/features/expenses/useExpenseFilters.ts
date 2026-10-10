import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ExpenseFilters } from '../../types/api';

const numberOrUndefined = (v: string | null) => {
  if (v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function useExpenseFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ExpenseFilters>(
    () => ({
      from: params.get('from') || undefined,
      to: params.get('to') || undefined,
      categoryId: numberOrUndefined(params.get('categoryId')),
      minAmount: numberOrUndefined(params.get('minAmount')),
      maxAmount: numberOrUndefined(params.get('maxAmount')),
      search: params.get('search') || undefined,
      sortBy: params.get('sortBy') === 'amount' ? 'amount' : 'date',
      order: params.get('order') === 'asc' ? 'asc' : 'desc',
      page: numberOrUndefined(params.get('page')) ?? 1,
      pageSize: 20,
    }),
    [params],
  );

  const update = useCallback(
    (patch: Partial<ExpenseFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || value === null) next.delete(key);
            else next.set(key, String(value));
          }
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const activeCount = [filters.from, filters.to, filters.categoryId, filters.minAmount, filters.maxAmount, filters.search]
    .filter((v) => v !== undefined).length;

  return { filters, update, reset, activeCount };
}

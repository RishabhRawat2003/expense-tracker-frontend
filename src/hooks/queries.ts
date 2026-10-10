import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { budgetsApi, categoriesApi, dashboardApi, expensesApi, reportsApi } from '../api';
import { getErrorMessage } from '../lib/errors';
import type { BudgetInput, ExpenseFilters, ExpenseInput, ReportParams } from '../types/api';

export const queryKeys = {
  categories: ['categories'] as const,
  expenses: (filters?: ExpenseFilters) => (filters ? (['expenses', filters] as const) : (['expenses'] as const)),
  budgets: (month?: string) => (month ? (['budgets', month] as const) : (['budgets'] as const)),
  dashboard: (month?: string) => (month ? (['dashboard', month] as const) : (['dashboard'] as const)),
  report: (params?: ReportParams) => (params ? (['report', params] as const) : (['report'] as const)),
};

function useInvalidateSpending() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.expenses() }),
      qc.invalidateQueries({ queryKey: queryKeys.budgets() }),
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() }),
      qc.invalidateQueries({ queryKey: queryKeys.report() }),
    ]);
}

const onError = (err: unknown) => toast.error(getErrorMessage(err));

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.list,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
    onError,
  });
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: queryKeys.expenses(filters),
    queryFn: () => expensesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSaveExpense() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: ExpenseInput }) =>
      id ? expensesApi.update(id, input) : expensesApi.create(input),
    onSuccess: (_data, { id }) => {
      toast.success(id ? 'Expense updated' : 'Expense added');
      return invalidate();
    },
    onError,
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: expensesApi.remove,
    onSuccess: () => {
      toast.success('Expense deleted');
      return invalidate();
    },
    onError,
  });
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: queryKeys.budgets(month),
    queryFn: () => budgetsApi.list(month),
  });
}

export function useSaveBudget() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: BudgetInput }) =>
      id ? budgetsApi.update(id, input.amount) : budgetsApi.create(input),
    onSuccess: (_data, { id }) => {
      toast.success(id ? 'Budget updated' : 'Budget created');
      return invalidate();
    },
    onError,
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: budgetsApi.remove,
    onSuccess: () => {
      toast.success('Budget removed');
      return invalidate();
    },
    onError,
  });
}

export function useCopyBudgets() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => budgetsApi.copy(from, to),
    onSuccess: ({ copied }) => {
      toast.success(copied ? `Copied ${copied} budget${copied > 1 ? 's' : ''}` : 'Nothing new to copy');
      return invalidate();
    },
    onError,
  });
}

export function useDashboard(month: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(month),
    queryFn: () => dashboardApi.get(month),
    placeholderData: keepPreviousData,
  });
}

export function useReport(params: ReportParams) {
  return useQuery({
    queryKey: queryKeys.report(params),
    queryFn: () => reportsApi.get(params),
    placeholderData: keepPreviousData,
  });
}

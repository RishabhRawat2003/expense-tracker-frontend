import { http } from './http';
import type {
  AuthResponse,
  Budget,
  BudgetInput,
  Category,
  Dashboard,
  Expense,
  ExpenseFilters,
  ExpenseInput,
  LoginInput,
  Paginated,
  RegisterInput,
  Report,
  ReportParams,
} from '../types/api';

const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const authApi = {
  login: (input: LoginInput) =>
    data(http.post<AuthResponse>('/auth/login', input, { skipAuthRefresh: true })),
  register: (input: RegisterInput) =>
    data(http.post<AuthResponse>('/auth/register', input, { skipAuthRefresh: true })),
  logout: () => http.post('/auth/logout', undefined, { skipAuthRefresh: true }),
};

export const categoriesApi = {
  list: () => data(http.get<Category[]>('/categories')),
  create: (input: Omit<Category, 'id'>) => data(http.post<Category>('/categories', input)),
  remove: (id: number) => http.delete(`/categories/${id}`),
};

export const expensesApi = {
  list: (filters: ExpenseFilters) => data(http.get<Paginated<Expense>>('/expenses', { params: filters })),
  create: (input: ExpenseInput) => data(http.post<Expense>('/expenses', input)),
  update: (id: number, input: Partial<ExpenseInput>) => data(http.patch<Expense>(`/expenses/${id}`, input)),
  remove: (id: number) => http.delete(`/expenses/${id}`),
};

export const budgetsApi = {
  list: (month: string) => data(http.get<Budget[]>('/budgets', { params: { month } })),
  create: (input: BudgetInput) => data(http.post<Budget>('/budgets', input)),
  update: (id: number, amount: number) => data(http.patch<Budget>(`/budgets/${id}`, { amount })),
  remove: (id: number) => http.delete(`/budgets/${id}`),
  copy: (fromMonth: string, toMonth: string) =>
    data(http.post<{ copied: number }>('/budgets/copy', { fromMonth, toMonth })),
};

export const dashboardApi = {
  get: (month: string) => data(http.get<Dashboard>('/dashboard', { params: { month } })),
};

export const reportsApi = {
  get: (params: ReportParams) => data(http.get<Report>('/reports', { params })),
  exportCsv: async (params: ReportParams) => {
    const res = await http.get<Blob>('/reports/export', { params, responseType: 'blob' });
    const disposition = res.headers['content-disposition'] as string | undefined;
    const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? 'report.csv';
    return { blob: res.data, filename };
  },
};

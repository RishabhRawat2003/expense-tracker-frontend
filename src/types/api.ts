export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Expense {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  amount: number;
  description: string;
  spentOn: string;
  createdAt: string;
}

export interface ExpenseInput {
  categoryId: number;
  amount: number;
  description: string;
  spentOn: string;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: number;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  totalAmount: number;
  page: number;
  pageSize: number;
}

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  month: string;
  amount: number;
  spent: number;
}

export interface BudgetInput {
  categoryId: number;
  month: string;
  amount: number;
}

export interface CategorySummary {
  categoryId: number;
  name: string;
  color: string;
  spent: number;
  budget: number;
  expenseCount: number;
}

export interface TrendPoint {
  label: string;
  total: number;
}

export interface Dashboard {
  month: string;
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  previousMonthSpent: number;
  overBudgetCount: number;
  categories: CategorySummary[];
  daily: TrendPoint[];
  recent: Expense[];
}

export type ReportParams =
  | { period: 'monthly'; month: string }
  | { period: 'yearly'; year: number };

export interface Report {
  period: ReportParams['period'];
  label: string;
  from: string;
  to: string;
  totalSpent: number;
  totalBudget: number;
  expenseCount: number;
  categories: CategorySummary[];
  trend: TrendPoint[];
}

export interface ApiErrorBody {
  message: string;
  errors?: { field: string; message: string }[];
}

import { useMemo, useState } from 'react';

export function usePagination<T>(items: readonly T[], pageSize: number, resetKey?: unknown) {
  const [state, setState] = useState({ page: 1, key: resetKey });

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = state.key === resetKey ? state.page : 1;
  const page = Math.min(requested, pageCount);

  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);

  const setPage = (next: number) => setState({ page: next, key: resetKey });

  return { page, pageSize, total: items.length, pageItems, setPage };
}

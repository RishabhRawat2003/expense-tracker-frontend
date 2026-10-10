import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { useCategories } from '../../hooks/queries';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { ExpenseFilters } from '../../types/api';

const toNumber = (v: string) => (v === '' || !Number.isFinite(Number(v)) ? undefined : Number(v));

interface Props {
  filters: ExpenseFilters;
  activeCount: number;
  onChange: (patch: Partial<ExpenseFilters>) => void;
  onReset: () => void;
}

export function ExpenseFiltersBar({ filters, activeCount, onChange, onReset }: Props) {
  const { data: categories = [] } = useCategories();
  const [showMore, setShowMore] = useState(activeCount > 0);

  const [search, setSearch] = useState(filters.search ?? '');
  const [minAmount, setMinAmount] = useState(filters.minAmount?.toString() ?? '');
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount?.toString() ?? '');
  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedMin = useDebouncedValue(minAmount, 350);
  const debouncedMax = useDebouncedValue(maxAmount, 350);

  const latest = useRef({ filters, onChange });
  useEffect(() => {
    latest.current = { filters, onChange };
  });

  useEffect(() => {
    const { filters: current, onChange: push } = latest.current;
    const next = {
      search: debouncedSearch.trim() || undefined,
      minAmount: toNumber(debouncedMin),
      maxAmount: toNumber(debouncedMax),
    };
    if (
      next.search !== current.search ||
      next.minAmount !== current.minAmount ||
      next.maxAmount !== current.maxAmount
    ) {
      push(next);
    }
  }, [debouncedSearch, debouncedMin, debouncedMax]);

  const clearAll = () => {
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
    onReset();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search descriptions…"
            aria-label="Search expenses"
            className="h-11 w-full rounded-lg sm:h-10 border border-slate-300 bg-white pr-3 pl-9 text-base shadow-sm sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className={clsx(showMore && 'border-brand-500 text-brand-700')}
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span>
          )}
        </Button>
      </div>

      {showMore && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-6">
          <DatePicker
            label="From"
            placeholder="Any date"
            clearable
            value={filters.from}
            max={filters.to}
            onChange={(from) => onChange({ from: from || undefined })}
          />
          <DatePicker
            label="To"
            placeholder="Any date"
            clearable
            value={filters.to}
            min={filters.from}
            onChange={(to) => onChange({ to: to || undefined })}
          />
          <div className="col-span-2">
            <Select
              label="Category"
              value={filters.categoryId ?? ''}
              onChange={(e) => onChange({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Min ₹"
            type="number"
            inputMode="decimal"
            min="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            label="Max ₹"
            type="number"
            inputMode="decimal"
            min="0"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          {activeCount > 0 && (
            <div className="col-span-2 md:col-span-6">
              <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
                <X className="size-4" /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

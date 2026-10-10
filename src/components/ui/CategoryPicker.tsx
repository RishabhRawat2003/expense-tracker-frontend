import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { Category } from '../../types/api';
import { controlClass, FieldShell } from './Field';
import { Popover } from './Popover';

interface CategoryPickerProps {
  categories: Category[];
  value?: number;
  onChange: (id: number) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
  id?: string;
}

const SEARCH_THRESHOLD = 6;

function Swatch({ category }: { category: Category }) {
  return (
    <span
      className="grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold"
      style={{ backgroundColor: `${category.color}1f`, color: category.color }}
    >
      {category.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function CategoryPicker({
  categories,
  value,
  onChange,
  onBlur,
  label,
  error,
  placeholder = 'Select a category',
  emptyMessage = 'No categories available',
  id,
}: CategoryPickerProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const listId = `${triggerId}-list`;
  const anchorRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const selected = categories.find((c) => c.id === value);
  const searchable = categories.length > SEARCH_THRESHOLD;

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  }, [categories, query]);

  const show = () => {
    setQuery('');
    setActive(Math.max(0, categories.findIndex((c) => c.id === value)));
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);

  const choose = (category: Category) => {
    onChange(category.id);
    close();
    anchorRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    (searchRef.current ?? listRef.current)?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      show();
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        setActive((i) => (i >= last ? 0 : i + 1));
        break;
      case 'ArrowUp':
        setActive((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        setActive(0);
        break;
      case 'End':
        setActive(last);
        break;
      case 'Enter':
        if (options[active]) choose(options[active]);
        break;
      case 'Tab':
        close();
        return;
      default:
        return;
    }
    e.preventDefault();
  };

  const activeId = options[active] ? `${listId}-${options[active].id}` : undefined;

  return (
    <FieldShell id={triggerId} label={label} error={error}>
      <button
        ref={anchorRef}
        id={triggerId}
        type="button"
        disabled={categories.length === 0}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={!!error}
        className={clsx(
          controlClass,
          'flex items-center gap-2.5 text-left',
          selected && 'pl-2',
          error ? 'border-red-400' : open ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-300',
        )}
      >
        {selected && <Swatch category={selected} />}
        <span className={clsx('flex-1 truncate', !selected && 'text-slate-400')}>
          {categories.length === 0 ? emptyMessage : (selected?.name ?? placeholder)}
        </span>
        <ChevronDown
          className={clsx('size-4 shrink-0 transition-transform', open ? 'rotate-180 text-brand-600' : 'text-slate-400')}
        />
      </button>

      <Popover open={open} onClose={close} anchorRef={anchorRef} label={label ?? 'Choose category'} matchWidth className="p-1.5">
        {searchable && (
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onListKeyDown}
              placeholder="Search categories"
              aria-label="Search categories"
              aria-controls={listId}
              aria-activedescendant={activeId}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-8 text-base focus:border-brand-500 focus:bg-white focus:outline-none sm:text-sm"
            />
          </div>
        )}

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={searchable ? -1 : 0}
          onKeyDown={searchable ? undefined : onListKeyDown}
          aria-activedescendant={searchable ? undefined : activeId}
          className="max-h-60 overflow-y-auto overscroll-contain focus:outline-none"
        >
          {options.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">No matching categories</li>
          ) : (
            options.map((c, i) => {
              const isSelected = c.id === value;
              return (
                <li
                  key={c.id}
                  id={`${listId}-${c.id}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(c)}
                  className={clsx(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm',
                    i === active ? 'bg-slate-100' : '',
                    isSelected ? 'font-medium text-brand-700' : 'text-slate-700',
                  )}
                >
                  <Swatch category={c} />
                  <span className="flex-1 truncate">{c.name}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-brand-600" />}
                </li>
              );
            })
          )}
        </ul>
      </Popover>
    </FieldShell>
  );
}

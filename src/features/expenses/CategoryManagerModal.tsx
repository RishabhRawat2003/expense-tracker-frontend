import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { CategoryDot } from '../../components/ui/misc';
import { queryKeys, useCategories, useCreateCategory } from '../../hooks/queries';
import { usePagination } from '../../hooks/usePagination';
import { getErrorMessage } from '../../lib/errors';

const CATEGORIES_PER_PAGE = 8;

const PALETTE = ['#f97316', '#0ea5e9', '#8b5cf6', '#14b8a6', '#ec4899', '#22c55e', '#eab308', '#ef4444', '#64748b'];

export function CategoryManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const pagination = usePagination(categories, CATEGORIES_PER_PAGE);

  const remove = useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(
      { name: trimmed, color },
      {
        onSuccess: () => {
          setName('');
          toast.success(`Added "${trimmed}"`);
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      title="Categories"
      description="Organise your expenses with your own categories."
      icon={<Tags className="size-5" />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mb-5 space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="New category name"
            aria-label="New category name"
            className="h-11 min-w-0 flex-1 sm:h-10 rounded-lg border border-slate-300 px-3 text-base sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
          />
          <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category color">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className="size-7 rounded-full ring-offset-2 transition aria-checked:ring-2 aria-checked:ring-slate-400"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </form>

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {pagination.pageItems.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
            <CategoryDot color={c.color} />
            <span className="flex-1 text-slate-700">{c.name}</span>
            <button
              onClick={() => remove.mutate(c.id)}
              disabled={remove.isPending}
              className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={pagination.setPage}
        className="border-t-0 px-0"
      />
      <p className="mt-2 text-xs text-slate-500">Categories that still have expenses can't be deleted.</p>
    </Modal>
  );
}

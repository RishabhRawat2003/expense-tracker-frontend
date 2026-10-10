import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PiggyBank } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CategoryPicker } from '../../components/ui/CategoryPicker';
import { AmountInput } from '../../components/ui/Field';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { CategoryAvatar } from '../../components/ui/misc';
import { useCategories, useSaveBudget } from '../../hooks/queries';
import { formatCurrency, formatMonth } from '../../lib/format';
import type { Budget } from '../../types/api';

const schema = z.object({
  categoryId: z.coerce.number({ invalid_type_error: 'Pick a category' }).int().positive('Pick a category'),
  amount: z.coerce
    .number({ invalid_type_error: 'Enter a limit' })
    .positive('Limit must be greater than 0')
    .max(9_999_999_999),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  open: boolean;
  month: string;
  budget: Budget | null;
  usedCategoryIds: Set<number>;
  onClose: () => void;
}

export function BudgetFormModal({ open, month, budget, usedCategoryIds, onClose }: Props) {
  return (
    <Modal
      open={open}
      title={budget ? 'Edit budget' : 'New budget'}
      description={`Monthly spending limit for ${formatMonth(month)}`}
      icon={<PiggyBank className="size-5" />}
      onClose={onClose}
    >
      <BudgetForm key={budget?.id ?? 'new'} month={month} budget={budget} usedCategoryIds={usedCategoryIds} onDone={onClose} />
    </Modal>
  );
}

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000];

function BudgetForm({
  month,
  budget,
  usedCategoryIds,
  onDone,
}: Omit<Props, 'open' | 'onClose'> & { onDone: () => void }) {
  const { data: categories = [] } = useCategories();
  const save = useSaveBudget();
  const available = categories.filter((c) => !usedCategoryIds.has(c.id));

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: budget ? { categoryId: budget.categoryId, amount: budget.amount } : undefined,
  });

  const onSubmit = handleSubmit((values) => {
    save.mutate({ id: budget?.id, input: { ...values, month } }, { onSuccess: onDone });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {budget ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <CategoryAvatar name={budget.categoryName} color={budget.categoryColor} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{budget.categoryName}</p>
            <p className="text-xs text-slate-500">{formatCurrency(budget.spent)} spent so far</p>
          </div>
        </div>
      ) : (
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoryPicker
              label="Category"
              categories={available}
              value={typeof field.value === 'number' ? field.value : undefined}
              onChange={field.onChange}
              error={errors.categoryId?.message}
              emptyMessage="Every category already has a budget this month."
            />
          )}
        />
      )}

      <div className="space-y-2">
        <AmountInput label="Monthly limit" placeholder="5000" autoFocus={!!budget} error={errors.amount?.message} {...register('amount')} />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setValue('amount', amount, { shouldValidate: true })}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {formatCurrency(amount).replace(/\.00$/, '')}
            </button>
          ))}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {budget ? 'Save changes' : 'Create budget'}
        </Button>
      </ModalFooter>
    </form>
  );
}

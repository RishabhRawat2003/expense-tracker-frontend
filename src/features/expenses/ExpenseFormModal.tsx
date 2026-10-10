import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, ReceiptText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CategoryPicker } from '../../components/ui/CategoryPicker';
import { DatePicker } from '../../components/ui/DatePicker';
import { AmountInput, Input } from '../../components/ui/Field';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useCategories, useSaveExpense } from '../../hooks/queries';
import { today } from '../../lib/dates';
import type { Expense } from '../../types/api';

const schema = z.object({
  categoryId: z.coerce.number({ invalid_type_error: 'Pick a category' }).int().positive('Pick a category'),
  amount: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .positive('Amount must be greater than 0')
    .max(9_999_999_999, 'That is a lot of money'),
  description: z.string().trim().max(255),
  spentOn: z
    .string()
    .min(1, 'Pick a date')
    .refine((d) => d <= today(), 'Date cannot be in the future'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseFormModal({ open, expense, onClose }: Props) {
  return (
    <Modal
      open={open}
      title={expense ? 'Edit expense' : 'Add expense'}
      description={expense ? 'Update the details of this expense.' : 'Record something you spent money on.'}
      icon={expense ? <Pencil className="size-5" /> : <ReceiptText className="size-5" />}
      onClose={onClose}
    >
      <ExpenseForm key={expense?.id ?? 'new'} expense={expense} onDone={onClose} />
    </Modal>
  );
}

function ExpenseForm({ expense, onDone }: { expense: Expense | null; onDone: () => void }) {
  const { data: categories = [] } = useCategories();
  const save = useSaveExpense();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          categoryId: expense.categoryId,
          amount: expense.amount,
          description: expense.description,
          spentOn: expense.spentOn,
        }
      : { description: '', spentOn: today() },
  });

  const onSubmit = handleSubmit((input) => {
    save.mutate({ id: expense?.id, input }, { onSuccess: onDone });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AmountInput label="Amount" placeholder="0.00" autoFocus error={errors.amount?.message} {...register('amount')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoryPicker
              label="Category"
              categories={categories}
              value={typeof field.value === 'number' ? field.value : undefined}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.categoryId?.message}
            />
          )}
        />
        <Controller
          name="spentOn"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              max={today()}
              error={errors.spentOn?.message}
            />
          )}
        />
      </div>

      <Input
        label="Description"
        placeholder="e.g. Groceries at DMart"
        maxLength={255}
        hint="Optional"
        error={errors.description?.message}
        {...register('description')}
      />

      <ModalFooter>
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {expense ? 'Save changes' : 'Add expense'}
        </Button>
      </ModalFooter>
    </form>
  );
}

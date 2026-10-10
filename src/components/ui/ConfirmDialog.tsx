import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  icon = <Trash2 className="size-5" />,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !loading && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-dialog-in relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-900/5"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/60">
          {icon}
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-slate-500">{message}</div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

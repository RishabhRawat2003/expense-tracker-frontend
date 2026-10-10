import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
      {children}
    </div>
  );
}

export function Modal({ open, title, description, icon, onClose, children, size = 'md' }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={clsx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-900/5',
          'animate-sheet-up rounded-t-3xl sm:animate-dialog-in sm:rounded-2xl',
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg',
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden />

        <header className="flex shrink-0 items-start gap-3 px-5 pt-4 pb-4 sm:px-6 sm:pt-6">
          {icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
  label?: string;
  matchWidth?: boolean;
}

const GAP = 6;
const EDGE = 8;

export function Popover({
  open,
  onClose,
  anchorRef,
  children,
  align = 'start',
  className,
  label,
  matchWidth,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const a = anchor.getBoundingClientRect();
      if (matchWidth) panel.style.width = `${a.width}px`;
      const p = panel.getBoundingClientRect();

      let top = a.bottom + GAP;
      const fitsBelow = top + p.height <= window.innerHeight - EDGE;
      const fitsAbove = a.top - GAP - p.height >= EDGE;
      if (!fitsBelow && fitsAbove) top = a.top - GAP - p.height;

      const preferred = align === 'end' ? a.right - p.width : a.left;
      const left = Math.min(Math.max(EDGE, preferred), window.innerWidth - p.width - EDGE);

      panel.style.top = `${Math.max(EDGE, top)}px`;
      panel.style.left = `${left}px`;
    };

    place();
    const observer = new ResizeObserver(place);
    if (panelRef.current) observer.observe(panelRef.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorRef, align, matchWidth]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
      anchorRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={clsx(
        'animate-pop-in fixed z-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

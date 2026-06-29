import type { ReactNode } from 'react';

export type DrawerPosition = 'left' | 'right' | 'bottom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: DrawerPosition;
  title?: string;
}

const positionClass: Record<DrawerPosition, string> = {
  left: 'inset-y-0 left-0 h-full w-80',
  right: 'inset-y-0 right-0 h-full w-80',
  bottom: 'inset-x-0 bottom-0 w-full rounded-t-xl',
};

export function Drawer({ open, onClose, children, position = 'right', title }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className={`absolute bg-white shadow-xl ${positionClass[position]}`}>
        {title && (
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null,
);

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) return children;

  const handleClick = (e: React.MouseEvent) => {
    ctx.setOpen(!ctx.open);
    if (children.props.onClick) {
      children.props.onClick(e);
    }
  };

  return React.cloneElement(children, {
    onClick: handleClick,
  });
};

export const DropdownMenuContent: React.FC<{
  className?: string;
  align?: 'start' | 'end';
  children: React.ReactNode;
}> = ({ className, align = 'start', children }) => {
  const ctx = React.useContext(DropdownMenuContext);
  const [mounted, setMounted] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!ctx?.open) return;
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        ctx.setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ctx]);

  if (!ctx || !ctx.open || !mounted) return null;

  const content = (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg',
        align === 'end' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
};

export const DropdownMenuItem: React.FC<
  React.HTMLAttributes<HTMLButtonElement>
> = ({ className, children, ...props }) => (
  <button
    className={cn(
      'flex w-full items-center px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);


import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'Customer',
  'Table',
  'Delivery',
  'Pending',
  'Accepted',
  'Completed',
  'Order',
];

const GooeyFilter = () => {
  return (
    <svg aria-hidden className="absolute h-0 w-0">
      <defs>
        <filter id="goo-effect">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
};

const SearchIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.8, x: -4, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.8, x: -4, filter: 'blur(5px)' }}
      transition={{ delay: 0.1, duration: 0.8, type: 'spring', bounce: 0.15 }}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
      />
    </motion.svg>
  );
};

const LoadingIcon = () => {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      aria-label="Loading"
      role="status"
    >
      <line x1="128" y1="32" x2="128" y2="64" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="195.88" y1="60.12" x2="173.25" y2="82.75" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="224" y1="128" x2="192" y2="128" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="195.88" y1="195.88" x2="173.25" y2="173.25" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="128" y1="224" x2="128" y2="192" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="60.12" y1="195.88" x2="82.75" y2="173.25" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="32" y1="128" x2="64" y2="128" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
      <line x1="60.12" y1="60.12" x2="82.75" y2="82.75" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="16" />
    </svg>
  );
};

interface GooeySearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}

export const GooeySearchBar = ({
  value,
  onChange,
  placeholder = 'Search orders, customers...',
  className,
}: GooeySearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const suggestionData = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS.filter((item) => item.toLowerCase().includes(q)).slice(0, 4);
  }, [value]);

  useEffect(() => {
    if (!expanded) return;
    inputRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    let cancelled = false;
    if (!value.trim()) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  return (
    <div className={cn('relative', className)}>
      <GooeyFilter />
      <div
        className="relative flex items-center"
        style={{ filter: 'url(#goo-effect)' }}
      >
        <motion.button
          type="button"
          onClick={() => setExpanded(true)}
          initial={false}
          animate={{
            width: expanded ? 260 : 110,
            x: expanded ? -28 : 0,
          }}
          transition={{ duration: 0.75, type: 'spring', bounce: 0.15 }}
          className="relative z-10 h-11 rounded-full bg-white px-4 text-left shadow-sm ring-1 ring-slate-200"
        >
          {!expanded ? (
            <span className="text-sm font-semibold text-slate-700">Search</span>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-full w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          )}
        </motion.button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              key="search-icon"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 12, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.65, type: 'spring', bounce: 0.15 }}
              className="pointer-events-none z-20 text-slate-500"
            >
              {isLoading ? <LoadingIcon /> : <SearchIcon />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {expanded && suggestionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 top-12 z-30 w-64 space-y-1 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestionData.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


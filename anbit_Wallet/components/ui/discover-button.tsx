import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search01Icon,
  FavouriteIcon,
  Fire02Icon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

export type DiscoverTabId = 'popular' | 'favorites';

const TAB_STYLES = {
  popular: {
    light: {
      color: 'text-[#2563eb]',
      fill: 'fill-[#2563eb]',
      bg: 'bg-[#2563eb]/10',
    },
    dark: {
      color: 'text-[#2563eb]',
      fill: 'fill-[#2563eb]',
      bg: 'bg-[#2563eb]/25',
    },
  },
  favorites: {
    light: {
      color: 'text-gray-900',
      fill: 'fill-gray-900',
      bg: 'bg-gray-100',
    },
    dark: {
      color: 'text-white',
      fill: 'fill-white',
      bg: 'bg-white/15',
    },
  },
} as const;

export function DiscoverButton({
  searchQuery,
  onSearchChange,
  activeDiscoverTab,
  onDiscoverTabChange,
  labels,
  className,
  compact = false,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeDiscoverTab: DiscoverTabId;
  onDiscoverTabChange: (tab: DiscoverTabId) => void;
  labels: { popular: string; favorites: string; searchPlaceholder: string };
  className?: string;
  /** Μικρότερο ύψος, εικονίδια και padding — π.χ. στο /quests κάτω από κατηγορίες */
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const shell = isLight
    ? 'bg-white shadow-lg text-gray-800'
    : 'bg-[#1e1e1e] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.65)] text-zinc-100 ring-1 ring-white/[0.08]';

  const tabs = [
    { id: 'popular' as const, label: labels.popular, icon: Fire02Icon },
    { id: 'favorites' as const, label: labels.favorites, icon: FavouriteIcon },
  ];

  const barH = compact ? 'h-[46px]' : 'h-[60px]';
  const barPx = compact ? 'px-3' : 'px-[1.125rem]';
  const iconSearch = compact ? 'h-4 w-4' : 'h-6 w-6';
  const iconTab = compact ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const iconClose = compact ? 'h-4 w-4' : 'h-6 w-6';
  const expandCloseW = compact ? 44 : 60;
  const expandMarginL = compact ? 8 : 12;
  const tabPad = compact ? 'px-3 py-2' : 'px-5 py-3 sm:px-6';
  const tabLabel = compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm';
  const inputText = compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg';
  const minInput = compact ? 'min-w-[6.5rem]' : 'min-w-[8rem]';

  return (
    <div className={cn('flex h-full items-center', compact ? 'gap-2 p-1' : 'gap-3 p-2', className)}>
      <motion.div
        layout
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 230,
          mass: 1.2,
        }}
        onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
        className={cn(
          'relative flex cursor-pointer items-center overflow-hidden rounded-[3rem]',
          barH,
          barPx,
          shell,
          isSearchExpanded ? 'flex-1' : '',
        )}
      >
        <div className="shrink-0">
          <HugeiconsIcon icon={Search01Icon} className={cn(iconSearch, isLight ? 'text-gray-800' : 'text-zinc-200')} />
        </div>

        <motion.div
          initial={false}
          animate={{
            width: isSearchExpanded ? 'auto' : '0px',
            opacity: isSearchExpanded ? 1 : 0,
            filter: isSearchExpanded ? 'blur(0px)' : 'blur(4px)',
            marginLeft: isSearchExpanded ? `${expandMarginL}px` : '0px',
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 230,
            mass: 1.2,
          }}
          className="-mb-0.5 flex items-center overflow-hidden"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className={cn(
              'w-full border-0 bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              minInput,
              inputText,
              isLight ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-zinc-500',
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label={labels.searchPlaceholder}
          />
        </motion.div>
      </motion.div>

      <motion.div
        layout
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 230,
          mass: 1.2,
        }}
        className={cn('relative flex items-center overflow-hidden rounded-[3rem]', barH, shell)}
      >
        <motion.div
          initial={false}
          animate={{
            width: isSearchExpanded ? `${expandCloseW}px` : 'auto',
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 230,
            mass: 1.2,
          }}
          className="relative flex h-full items-center overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 0 : 1,
              filter: isSearchExpanded ? 'blur(4px)' : 'blur(0px)',
              width: 'auto',
            }}
            transition={{
              duration: 0.2,
            }}
            className="flex items-center whitespace-nowrap"
          >
            <div className={cn('flex items-center px-[6px]', compact ? 'gap-1' : 'gap-2')}>
              {tabs.map((tab) => {
                const styles = TAB_STYLES[tab.id][isLight ? 'light' : 'dark'];
                const active = activeDiscoverTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onDiscoverTabChange(tab.id)}
                    className={cn(
                      'relative flex items-center gap-2 rounded-[3rem] transition-colors',
                      tabPad,
                      active ? styles.color : isLight ? 'text-gray-700' : 'text-zinc-400',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="discover-bubble"
                        className={cn('absolute inset-0 z-0', styles.bg)}
                        style={{ borderRadius: 9999 }}
                        transition={{
                          type: 'spring',
                          bounce: 0.19,
                          duration: 0.4,
                        }}
                      />
                    )}
                    <HugeiconsIcon
                      icon={tab.icon}
                      className={cn('relative z-10', iconTab, active ? styles.fill : '')}
                    />
                    <span
                      className={cn(
                        'relative z-10 font-mono font-semibold uppercase tracking-tight',
                        tabLabel,
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              opacity: isSearchExpanded ? 1 : 0,
              filter: isSearchExpanded ? 'blur(0px)' : 'blur(4px)',
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: isSearchExpanded ? 'auto' : 'none' }}
          >
            <button
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="shrink-0 cursor-pointer rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Κλείσιμο αναζήτησης"
            >
              <HugeiconsIcon
                icon={MultiplicationSignIcon}
                className={cn(iconClose, isLight ? 'text-gray-800' : 'text-zinc-200')}
              />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DiscoverButton;

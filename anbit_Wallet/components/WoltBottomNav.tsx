import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Αρχική',
    icon: 'home',
    path: '/quests',
    matchPaths: ['/quests', '/'],
  },
  {
    id: 'categories',
    label: 'Κατηγορίες',
    icon: 'grid_view',
    path: '/network',
    matchPaths: ['/network', '/store-profile'],
  },
  {
    id: 'orders',
    label: 'Παραγγελίες',
    icon: 'receipt_long',
    path: '/profile/history',
    matchPaths: ['/profile/history'],
  },
  {
    id: 'profile',
    label: 'Προφίλ',
    icon: 'person',
    path: '/profile',
    matchPaths: ['/profile', '/settings', '/security'],
  },
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (!item.matchPaths) return pathname === item.path;
  return item.matchPaths.some((mp) => {
    if (mp === '/profile') {
      // Μόνο ακριβώς /profile (όχι /profile/history)
      return pathname === '/profile' || (pathname.startsWith('/profile') && !pathname.startsWith('/profile/history'));
    }
    return pathname.startsWith(mp);
  });
}

export const WoltBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[60] flex items-stretch border-t',
        'safe-area-pb',
        isLight
          ? 'bg-white border-[#E8E8E8]'
          : 'bg-[#111111] border-white/[0.08]',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item, location.pathname);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
              active
                ? isLight ? 'text-[#242424]' : 'text-[#009DE0]'
                : isLight ? 'text-[#717171] hover:text-[#242424]' : 'text-[#888] hover:text-[#009DE0]',
            )}
            aria-label={item.label}
          >
            <span
              className="material-symbols-outlined text-[24px] leading-none"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={cn('text-[10px] font-medium leading-none', active ? 'font-semibold' : '')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

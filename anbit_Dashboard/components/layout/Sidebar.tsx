import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Table,
  ListTodo,
  LayoutGrid,
  History,
  UtensilsCrossed,
  Users,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_BG = '#e63533';

const manageTableSubItems = [
  { to: '/reservation-list', icon: ListTodo, label: 'Reservation List' },
  { to: '/view-tables', icon: LayoutGrid, label: 'View Tables' },
  { to: '/table-history', icon: History, label: 'Table History' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isManageTableActive = manageTableSubItems.some((item) =>
    location.pathname.startsWith(item.to),
  );
  const [manageTableOpen, setManageTableOpen] = useState(isManageTableActive);
  const [collapsed, setCollapsed] = useState(false);

  // Keep expanded when a sub-route is active
  React.useEffect(() => {
    if (isManageTableActive) setManageTableOpen(true);
  }, [isManageTableActive]);

  // When collapsing, close submenu; when opening Manage Table while collapsed, expand sidebar
  const handleManageTableClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setManageTableOpen(true);
    } else {
      setManageTableOpen((o) => !o);
    }
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col shrink-0 text-white transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-56',
      )}
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      {/* Logo + burger – ελαχιστοποίηση: μόνο εικονίδια */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/15 transition-all',
          collapsed ? 'justify-center px-0' : 'justify-between gap-2 px-4',
        )}
      >
        {!collapsed && (
          <span
            className="font-logo text-3xl font-extrabold tracking-tight text-white shrink-0"
            style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}
          >
            Anbit
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/95 hover:bg-white/15 transition-colors"
          aria-label={collapsed ? 'Άνοιγμα menu' : 'Σύμπτυξη menu'}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={cn('space-y-0.5', collapsed ? 'flex flex-col items-center px-2' : 'px-3')}>
          {/* Dashboard */}
          <li className="w-full">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white text-[#e63533]'
                    : 'text-white/95 hover:bg-white/10',
                )
              }
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Dashboard</span>}
            </NavLink>
          </li>

          {/* Order Line */}
          <li className="w-full">
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white text-[#e63533]'
                    : 'text-white/95 hover:bg-white/10',
                )
              }
            >
              <Receipt className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Order Line</span>}
            </NavLink>
          </li>

          {/* Manage Table (expandable with sub-items) */}
          <li className="w-full">
            <button
              type="button"
              onClick={handleManageTableClick}
              className={cn(
                'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isManageTableActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/95 hover:bg-white/10',
              )}
            >
              <Table className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="min-w-0 truncate">Manage Table</span>
                  {manageTableOpen ? (
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </>
              )}
            </button>
            {!collapsed && manageTableOpen && (
              <ul className="mt-0.5 space-y-0.5 pl-4">
                {manageTableSubItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-white text-[#e63533]'
                            : 'text-white/90 hover:bg-white/10',
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Manage Dish */}
          <li className="w-full">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white text-[#e63533]'
                    : 'text-white/95 hover:bg-white/10',
                )
              }
            >
              <UtensilsCrossed className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Manage Dish</span>}
            </NavLink>
          </li>

          {/* Customers */}
          <li className="w-full">
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white text-[#e63533]'
                    : 'text-white/95 hover:bg-white/10',
                )
              }
            >
              <Users className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Customers</span>}
            </NavLink>
          </li>

          {/* Help Center */}
          <li className="w-full">
            <NavLink
              to="/help"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white text-[#e63533]'
                    : 'text-white/95 hover:bg-white/10',
                )
              }
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Help Center</span>}
            </NavLink>
          </li>

          {/* Setting – αμέσως κάτω από Help Center */}
          <li className="w-full">
            <button
              type="button"
              className={cn(
                'flex w-full items-center rounded-lg text-sm font-medium text-white/95 transition-colors hover:bg-white/10',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="min-w-0 truncate">Setting</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Upgrade Plan – κρύβεται όταν το sidebar είναι collapsed */}
      {!collapsed && (
        <div className="shrink-0 px-3 pb-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-white">
              Ready for the Next Level?
            </h3>
            <p className="mt-1.5 text-xs leading-snug text-white/85">
              Upgrade to access powerful tools that simplify operations.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#e63533' }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* Admin profile – κάτω κάτω όπως στην εικόνα */}
      <div
        className={cn(
          'shrink-0 border-t border-white/15',
          collapsed ? 'flex justify-center p-2' : 'p-3',
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rex"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              className="rounded p-1 text-white/80 hover:bg-white/10"
              aria-label="Menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rex"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Rex Likefood
              </p>
              <p className="truncate text-xs text-white/80">
                rex@likearth.co
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1.5 text-white/80 hover:bg-white/10"
              aria-label="Menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

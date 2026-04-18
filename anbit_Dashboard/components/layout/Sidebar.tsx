import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Images,
  ChevronDown,
  ChevronRight,
  Menu,
  MoreVertical,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';

const SIDEBAR_BG_ADMIN = '#0C0C0C';
const SIDEBAR_BG_MERCHANT = '#0a0a0a';

const manageTableSubItems = [
  { to: '/reservation-list', icon: ListTodo, label: 'Reservation List' },
  { to: '/view-tables', icon: LayoutGrid, label: 'View Tables' },
  { to: '/table-history', icon: History, label: 'Table History' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const isManageTableActive = manageTableSubItems.some((item) =>
    location.pathname.startsWith(item.to),
  );
  const [manageTableOpen, setManageTableOpen] = useState(isManageTableActive);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('Admin');
  const isMerchant = roles.includes('Merchant');
  const sidebarBg = isAdmin ? SIDEBAR_BG_ADMIN : SIDEBAR_BG_MERCHANT;

  // Keep expanded when a sub-route is active
  React.useEffect(() => {
    if (isManageTableActive) setManageTableOpen(true);
  }, [isManageTableActive]);

  // Close mobile nav on route change
  React.useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleManageTableClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setManageTableOpen(true);
    } else {
      setManageTableOpen((o) => !o);
    }
  };

  // On mobile the sidebar is always "expanded" (never icon-only)
  const effectiveCollapsed = collapsed;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col shrink-0 font-playpen-sans text-white font-extrabold',
        // Mobile: fixed overlay; Desktop: static in flow
        'fixed inset-y-0 left-0 z-40 lg:relative lg:inset-auto lg:z-auto',
        'transition-transform duration-200 lg:transition-[width] lg:duration-200',
        // Mobile translate
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Width: always full on mobile, collapsed/expanded on desktop
        effectiveCollapsed ? 'w-64 lg:w-20' : 'w-64 lg:w-56',
      )}
      style={{ backgroundColor: sidebarBg }}
    >
      {/* Logo + burger */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/15 transition-all',
          effectiveCollapsed ? 'justify-between gap-2 px-4 lg:justify-center lg:px-0' : 'justify-between gap-2 px-4',
        )}
      >
        {/* Logo: always visible on mobile, hidden when desktop-collapsed */}
        <span
          className={cn(
            'font-anbit-brand text-3xl font-extrabold text-white shrink-0',
            effectiveCollapsed && 'lg:hidden',
          )}
        >
          Anbit
        </span>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/95 hover:bg-white/15 transition-colors"
          aria-label={effectiveCollapsed ? 'Άνοιγμα menu' : 'Σύμπτυξη menu'}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="flex lg:hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/95 hover:bg-white/15 transition-colors"
          aria-label="Κλείσιμο menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5">
        <ul
          className={cn(
            'space-y-0.5',
            effectiveCollapsed ? 'hidden lg:flex lg:flex-col lg:items-center lg:px-2' : 'px-3',
          )}
        >
          {isAdmin ? (
            <>
              <li className="w-full">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors',
                      'gap-3 px-3.5 py-3',
                      isActive
                        ? 'bg-white text-[#0C0C0C]'
                        : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Global Overview</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/admin/stores"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3.5 py-3',
                      isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Table className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Stores Management</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/admin/merchant-users"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Users className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Merchant Users</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Users className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Users & XP</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/admin/anbit-management"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Sparkles className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Anbit Management</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">System Settings</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="w-full">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Dashboard</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Receipt className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Orders Line</span>
                </NavLink>
              </li>

              <li className="w-full">
                <button
                  type="button"
                  onClick={handleManageTableClick}
                  className={cn(
                    'flex w-full items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3.5 py-3',
                    isManageTableActive ? 'bg-white/15 text-white' : 'text-white/95 hover:bg-white/10',
                  )}
                >
                  <Table className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Manage Table</span>
                  {manageTableOpen ? (
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </button>
                {manageTableOpen && (
                  <ul className="mt-0.5 space-y-0.5 pl-4">
                    {manageTableSubItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-extrabold transition-colors',
                              isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/90 hover:bg-white/10',
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

              <li className="w-full">
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3.5 py-3',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <UtensilsCrossed className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Manage Dish</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/merchant/banners"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3.5 py-3',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Images className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Offers</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3.5 py-3',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Users className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Customers</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/help"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <HelpCircle className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Help Center</span>
                </NavLink>
              </li>

              <li className="w-full">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-extrabold transition-colors gap-3 px-3 py-2.5',
                      isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                    )
                  }
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">Settings</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Collapsed icon-only nav (desktop only) */}
        {effectiveCollapsed && (
          <ul className="hidden lg:flex flex-col items-center space-y-0.5 px-2">
            {isAdmin ? (
              <>
                {[
                  { to: '/', icon: LayoutDashboard },
                  { to: '/admin/stores', icon: Table },
                  { to: '/admin/merchant-users', icon: Users },
                  { to: '/admin/customers', icon: Users },
                  { to: '/admin/anbit-management', icon: Sparkles },
                  { to: '/admin/settings', icon: Settings },
                ].map(({ to, icon: Icon }) => (
                  <li key={to} className="w-full">
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex w-full justify-center rounded-lg p-3 transition-colors',
                          isActive ? 'bg-white text-[#0C0C0C]' : 'text-white/95 hover:bg-white/10',
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </NavLink>
                  </li>
                ))}
              </>
            ) : (
              <>
                {[
                  { to: '/', icon: LayoutDashboard },
                  { to: '/orders', icon: Receipt },
                  { to: '/products', icon: UtensilsCrossed },
                  { to: '/merchant/banners', icon: Images },
                  { to: '/customers', icon: Users },
                  { to: '/help', icon: HelpCircle },
                  { to: '/settings', icon: Settings },
                ].map(({ to, icon: Icon }) => (
                  <li key={to} className="w-full">
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex w-full justify-center rounded-lg p-3 transition-colors',
                          isActive ? 'bg-white text-[#0a0a0a]' : 'text-white/95 hover:bg-white/10',
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </nav>

      {/* Upgrade Plan – merchant only, not collapsed */}
      {!effectiveCollapsed && !isAdmin && (
        <div className="shrink-0 px-3 pb-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-white">Ready for the Next Level?</h3>
            <p className="mt-1.5 text-xs leading-snug text-white/85">
              Upgrade to access powerful tools that simplify operations.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0C0C0C' }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* Profile section — desktop only */}
      <div
        className={cn(
          'hidden lg:block shrink-0 border-t border-white/15',
          effectiveCollapsed ? 'lg:flex lg:justify-center lg:p-2' : 'lg:p-3',
        )}
      >
        {effectiveCollapsed ? (
          <div className="relative flex flex-col items-center gap-1">
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rex" alt="" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              className="rounded p-1 text-white/80 hover:bg-white/10"
              aria-label="Menu"
              onClick={() => setProfileMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {profileMenuOpen && (
              <div className="absolute bottom-12 right-0 z-20 w-40 rounded-lg bg-white py-1 font-sans text-sm font-medium text-slate-800 shadow-lg shadow-black/20">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-1.5 text-left text-xs hover:bg-slate-100"
                  onClick={() => { setProfileMenuOpen(false); logout(); navigate('/auth', { replace: true }); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rex" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-white">{user?.username ?? 'User'}</p>
              <p className="truncate text-xs text-white/80">
                {isAdmin ? 'Platform Administrator' : isMerchant ? 'Store Manager' : 'Partner'}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded p-1.5 text-white/80 hover:bg-white/10"
              aria-label="Menu"
              onClick={() => setProfileMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {profileMenuOpen && (
              <div className="absolute bottom-12 right-0 z-20 w-44 rounded-lg bg-white py-1 font-sans text-sm font-medium text-slate-800 shadow-lg shadow-black/20">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-1.5 text-left text-xs hover:bg-slate-100"
                  onClick={() => { setProfileMenuOpen(false); logout(); navigate('/auth', { replace: true }); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile profile section (always expanded style) */}
      <div className="lg:hidden shrink-0 border-t border-white/15 p-3">
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rex" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">{user?.username ?? 'User'}</p>
            <p className="truncate text-xs text-white/80">
              {isAdmin ? 'Platform Administrator' : isMerchant ? 'Store Manager' : 'Partner'}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded p-1.5 text-white/80 hover:bg-white/10"
            onClick={() => { logout(); navigate('/auth', { replace: true }); }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

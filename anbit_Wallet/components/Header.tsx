import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, Star, User, LogOut, Zap, Sun, Moon, ChevronDown } from 'lucide-react';
import { BurgerToggle } from './ui/BurgerToggle';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import LanguageSelector from './LanguageSelector';
import { CitySelectModal } from './CitySelectModal';
import AnbitWordmark from './AnbitWordmark';
import { NotificationPopover, defaultWalletNotifications, type Notification } from './ui/notification-popover';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isAuthenticated: boolean;
  onOpenQR?: () => void;
  totalXP?: number;
  onOpenLogin?: (returnTo?: string) => void;
  onOpenRegister?: () => void;
}

const SCROLL_THRESHOLD = 24;

const navPaths: { path: string; labelKey: string; icon: typeof User }[] = [
  { path: '/quests', labelKey: 'quests', icon: Star },
  { path: '/network', labelKey: 'network', icon: MapPin },
  { path: '/profile', labelKey: 'profile', icon: User },
];

/** Το προφίλ έχει nested routes (`/profile/history`, κ.λπ.) — ίδιο active style με quests/network. */
function isNavItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === '/profile') return pathname.startsWith('/profile');
  return pathname === itemPath;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onOpenQR, totalXP = 0, onOpenLogin, onOpenRegister }) => {
  const location = useLocation();
  const isStoreProfileRoute = location.pathname.startsWith('/store-profile/');
  const [isScrolled, setIsScrolled] = useState(false);
  const isStoreProfileHeroMode = isStoreProfileRoute && !isScrolled;
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletNotifications, setWalletNotifications] = useState<Notification[]>(() => [...defaultWalletNotifications]);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const closeCityModal = useCallback(() => setCityModalOpen(false), []);
  const { city, cityId, setCityId, pickNearestCityFromCoords } = useCity();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  /** Light, όχι store hero: πάνω στη σελίδα vs μετά scroll (σκούρη μπάρα μόνο στο scroll) */
  const navLightNotHero = theme === 'light' && !isStoreProfileHeroMode;
  const navLightRedBar = navLightNotHero && isScrolled;
  const navLightAtTop = navLightNotHero && !isScrolled;
  const notifNavButtonClass = isStoreProfileRoute
    ? 'relative w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-[#121214] border border-white/15 text-white hover:text-white transition-colors shadow-none'
    : navLightRedBar
      ? 'relative w-10 h-10 lg:w-11 lg:h-11 rounded-lg border border-white/30 bg-white/15 text-white hover:bg-white/25 transition-colors shadow-none'
      : navLightAtTop
        ? 'relative w-10 h-10 lg:w-11 lg:h-11 rounded-lg border border-anbit-border bg-white text-anbit-text hover:bg-anbit-input transition-colors shadow-none'
        : undefined;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close burger menu when navigating.
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!mobileMenuRef.current) return;
      if (mobileMenuRef.current.contains(target)) return;
      setIsMobileMenuOpen(false);
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full px-3 lg:px-5 py-3 lg:py-4 transition-colors duration-300',
          isStoreProfileRoute
            ? isScrolled
              ? 'glass-nav navbar-scrolled'
              : 'anbit-header-store-hero bg-transparent border-transparent shadow-none'
            : cn('glass-nav', isScrolled && 'navbar-scrolled'),
        )}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-1 sm:px-2">

          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 md:flex-initial md:justify-start md:gap-3 md:shrink-0">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-initial md:min-w-0">
            <div ref={mobileMenuRef} className="md:hidden relative shrink-0">
              <BurgerToggle
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
                className={
                  navLightRedBar
                    ? '!border-white/35 !bg-white/15 !text-white hover:!bg-white/25 hover:!text-white'
                    : navLightAtTop
                      ? '!border-anbit-border !bg-white !text-anbit-text hover:!bg-anbit-input hover:!text-anbit-text'
                      : undefined
                }
              />

              {isMobileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Mobile navigation"
                  className={cn(
                    'absolute left-0 top-full mt-2 w-64 rounded-2xl border border-anbit-border bg-anbit-card px-2 py-2 shadow-xl mobile-burger-menu',
                    navLightNotHero ? 'text-neutral-900' : 'text-anbit-text',
                  )}
                >
                  <div className="flex flex-col gap-1">
                    {navPaths.map((item) => {
                      const Icon = item.icon;
                      const isActive = isNavItemActive(item.path, location.pathname);
                      const isProfileAsGuest = item.path === "/profile" && !isAuthenticated && onOpenLogin;

                      const itemClass = cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors',
                        isActive
                          ? 'bg-[#009DE0] text-white'
                          : navLightNotHero
                            ? 'text-[#202125] hover:bg-[#EBF7FD] hover:text-[#009DE0]'
                            : 'text-white hover:bg-anbit-border/40 hover:text-white',
                      );

                      if (isProfileAsGuest) {
                        return (
                          <button
                            key={item.path}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              onOpenLogin?.('/profile');
                              setIsMobileMenuOpen(false);
                            }}
                            className={itemClass}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5 lg:w-6 lg:h-6',
                                isActive && (navLightNotHero ? 'text-white' : 'text-anbit-bg'),
                              )}
                            />
                            <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                          </button>
                        );
                      }

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={itemClass}
                        >
                            <Icon
                              className={cn(
                                'w-5 h-5 lg:w-6 lg:h-6',
                                isActive && (navLightNotHero ? 'text-white' : 'text-anbit-bg'),
                              )}
                            />
                          <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                        </NavLink>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-anbit-border flex flex-col gap-2">
                    <div className="px-3 py-1">
                      <div className="flex items-center gap-3">
                        <LanguageSelector
                          buttonClassName={
                            navLightNotHero
                              ? '!border-zinc-200 !bg-white !text-neutral-900 hover:!bg-zinc-100'
                              : undefined
                          }
                        />
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            navLightNotHero ? 'text-neutral-900' : 'text-anbit-text',
                          )}
                        >
                          {t("languageSelection")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        toggleTheme();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border transition-colors',
                        navLightNotHero
                          ? 'bg-white border-zinc-200 text-neutral-900 hover:bg-zinc-100'
                          : 'bg-anbit-card border-anbit-border text-white hover:text-white hover:bg-anbit-border/40',
                      )}
                      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
                    >
                      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <span className="text-sm font-semibold">{theme === "dark" ? "Light" : "Dark"}</span>
                    </button>

                    {isAuthenticated ? (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-anbit-border bg-anbit-card transition-colors',
                            navLightNotHero
                              ? 'text-neutral-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50'
                              : 'text-anbit-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/5',
                          )}
                          aria-label={t("logout")}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-semibold">{t("logout")}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onOpenLogin?.();
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-anbit-border bg-anbit-card transition-colors',
                            navLightNotHero
                              ? 'text-neutral-700 hover:text-neutral-900 hover:bg-zinc-100'
                              : 'text-anbit-muted hover:text-anbit-yellow hover:bg-anbit-border/40',
                          )}
                        >
                          <span className="text-sm font-semibold">Σύνδεση</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onOpenRegister?.();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-anbit-yellow text-anbit-yellow-content rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <span className="text-sm font-semibold">Εγγραφή</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/quests" className="logo-anbit shrink-0 cursor-pointer">
              <AnbitWordmark className="text-3xl sm:text-4xl lg:text-5xl" />
            </NavLink>
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className={cn(
                'flex min-w-0 max-w-[min(100%,11rem)] items-center gap-1.5 rounded-lg px-1.5 py-2 transition-colors focus:outline-none focus-visible:ring-2 sm:max-w-none sm:gap-2 sm:px-2 md:max-w-none',
                navLightRedBar
                  ? 'text-white focus-visible:ring-white/45 hover:text-white/90'
                  : navLightAtTop
                    ? 'text-anbit-text focus-visible:ring-anbit-brand/25 hover:text-anbit-brand-hover'
                    : cn(
                        'text-anbit-text focus-visible:ring-anbit-yellow/50',
                        theme === 'dark' ? 'hover:text-white/80' : 'hover:text-anbit-yellow',
                      ),
              )}
              aria-label="Αλλαγή τοποθεσίας"
              aria-expanded={cityModalOpen}
              aria-haspopup="dialog"
            >
              <MapPin
                className="w-5 h-5 lg:w-6 lg:h-6 shrink-0 text-[#009DE0]"
                strokeWidth={2.5}
              />
              <span className="truncate text-sm font-semibold lg:text-base sm:max-w-[120px]">{city.labelEl}</span>
              <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform', cityModalOpen && 'rotate-180')} />
            </button>
            </div>
            {isAuthenticated ? (
              <div className="ml-1 shrink-0 md:hidden">
                <NotificationPopover
                  notifications={walletNotifications}
                  onNotificationsChange={setWalletNotifications}
                  buttonClassName={notifNavButtonClass}
                  title={t('notificationsTitle')}
                  markAllReadLabel={t('markAllNotificationsRead')}
                  bellAriaLabel={t('notificationsBellAria')}
                />
              </div>
            ) : null}
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <nav
              className={cn(
                'flex items-center justify-center gap-1 rounded-full px-2 py-1 shrink-0',
                isStoreProfileHeroMode
                  ? 'bg-[#121214] border border-white/15 backdrop-blur-sm'
                  : navLightRedBar
                    ? 'bg-white/15 border border-white/25'
                    : navLightAtTop
                      ? 'bg-white border border-anbit-border'
                      : 'bg-white/[0.03] border border-anbit-border',
              )}
            >
              {navPaths.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.path, location.pathname);
                const isProfileAsGuest = item.path === '/profile' && !isAuthenticated && onOpenLogin;
                const baseClass = cn(
                  'relative group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full transition-all',
                  isActive
                    ? 'bg-[#009DE0] text-white shadow-sm'
                    : isStoreProfileHeroMode
                      ? 'bg-[#121214] text-white hover:bg-[#121214] hover:text-white'
                      : navLightRedBar
                        ? 'text-[#202125] hover:bg-[#EBF7FD] hover:text-[#009DE0]'
                        : navLightAtTop
                          ? 'text-[#202125] hover:bg-[#EBF7FD] hover:text-[#009DE0]'
                          : 'text-white hover:bg-anbit-border/40 hover:text-white',
                );
                const hoverCardContent = (
                  <div
                    className="nav-hover-card pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-anbit-border bg-anbit-card px-4 py-3 shadow-lg outline-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    <p
                      className={cn(
                        'nav-hover-card-text text-center text-sm font-semibold',
                        navLightAtTop ? 'text-anbit-text' : navLightNotHero ? 'text-neutral-900' : 'text-anbit-text',
                      )}
                    >
                      {t(item.labelKey)}
                    </p>
                  </div>
                );
                if (isProfileAsGuest) {
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onOpenLogin?.('/profile')}
                      className={baseClass}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 lg:w-6 lg:h-6',
                          isActive &&
                          (navLightRedBar ? 'text-[#0a0a0a]' : navLightAtTop ? 'text-anbit-bg' : 'text-anbit-bg'),
                        )}
                      />
                      {hoverCardContent}
                    </button>
                  );
                }
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={baseClass}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 lg:w-6 lg:h-6',
                        isActive &&
                          (navLightRedBar ? 'text-[#0a0a0a]' : navLightAtTop ? 'text-anbit-bg' : 'text-anbit-bg'),
                      )}
                    />
                    {hoverCardContent}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LanguageSelector
              buttonClassName={
                isStoreProfileHeroMode
                  ? '!bg-[#121214] !border-white/15 !text-white'
                  : navLightRedBar
                    ? '!border-white/35 !bg-white/15 !text-white hover:!bg-white/25'
                    : navLightAtTop
                      ? '!border-anbit-border !bg-white !text-anbit-text hover:!bg-anbit-input'
                      : undefined
              }
            />
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-[#EBF7FD] border border-[#009DE0]/20">
                  <Zap className="w-4 h-4 shrink-0 text-[#009DE0] fill-[#009DE0]" />
                  <span className="anbit-tabular-nums text-sm font-bold tracking-tighter text-[#009DE0]">
                    {totalXP.toLocaleString()} XP
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    'w-10 h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center transition-colors',
                    isStoreProfileHeroMode
                      ? 'bg-[#121214] border border-white/15 backdrop-blur-sm text-white hover:text-white'
                      : navLightRedBar
                        ? 'border border-white/35 bg-white/15 text-white hover:bg-white/25'
                        : navLightAtTop
                          ? 'border border-anbit-border bg-white text-anbit-text hover:bg-anbit-input'
                          : 'bg-white/[0.05] border border-anbit-border text-white hover:text-white',
                  )}
                  aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <NotificationPopover
                  notifications={walletNotifications}
                  onNotificationsChange={setWalletNotifications}
                  buttonClassName={notifNavButtonClass}
                  title={t('notificationsTitle')}
                  markAllReadLabel={t('markAllNotificationsRead')}
                  bellAriaLabel={t('notificationsBellAria')}
                />
                <button
                  type="button"
                  onClick={() => logout()}
                  className={cn(
                    'flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border transition-colors',
                    isStoreProfileRoute
                      ? 'border-white/15 bg-[#121214] text-white hover:text-red-300 hover:border-red-300/60 hover:bg-[#121214]'
                      : navLightRedBar
                        ? 'border-white/35 bg-white/10 text-white hover:text-red-100 hover:border-red-200/80 hover:bg-red-600/30'
                        : navLightAtTop
                          ? 'border-anbit-border bg-white text-anbit-text hover:text-red-600 hover:border-red-300 hover:bg-red-50'
                          : 'border-anbit-border bg-white/[0.03] text-anbit-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/5',
                  )}
                  aria-label={t('logout')}
                >
                  <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-lg font-semibold tracking-tight normal-case hidden sm:inline">{t('logout')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    'w-10 h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center transition-colors',
                    isStoreProfileHeroMode
                      ? 'bg-[#121214] border border-white/15 backdrop-blur-sm text-white hover:text-white'
                      : navLightRedBar
                        ? 'border border-white/35 bg-white/15 text-white hover:bg-white/25'
                        : navLightAtTop
                          ? 'border border-anbit-border bg-white text-anbit-text hover:bg-anbit-input'
                          : 'bg-white/[0.05] border border-anbit-border text-white hover:text-white',
                  )}
                  aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLogin?.()}
                  className="px-4 py-2 text-sm font-semibold text-[#009DE0] hover:text-[#007BB5] transition-colors"
                >
                  Σύνδεση
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-4 py-2.5 text-sm font-bold bg-[#009DE0] text-white rounded-lg hover:bg-[#007BB5] transition-colors"
                >
                  Εγγραφή
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <CitySelectModal
        isOpen={cityModalOpen}
        onClose={closeCityModal}
        currentCityId={cityId}
        onConfirm={setCityId}
        pickNearestFromCoords={pickNearestCityFromCoords}
      />
    </>
  );
};

export default Header;

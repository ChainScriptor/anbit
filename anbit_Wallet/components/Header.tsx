import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, Star, User, LogOut, Zap, Sun, Moon, ChevronDown } from 'lucide-react';
import { BurgerToggle } from './ui/BurgerToggle';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import LanguageSelector from './LanguageSelector';
import { CitySelectModal } from './CitySelectModal';
import AnbitWordmark from './AnbitWordmark';
import { NotificationPopover, defaultWalletNotifications, type Notification } from './ui/notification-popover';

interface HeaderProps {
  isAuthenticated: boolean;
  onOpenQR?: () => void;
  totalXP?: number;
  onOpenLogin?: (returnTo?: string) => void;
  onOpenRegister?: () => void;
}

const SCROLL_THRESHOLD = 24;

const navPaths: { path: string; labelKey: string; icon: typeof Home }[] = [
  { path: '/dashboard', labelKey: 'dashboard', icon: Home },
  { path: '/network', labelKey: 'network', icon: MapPin },
  { path: '/quests', labelKey: 'quests', icon: Star },
  { path: '/profile', labelKey: 'profile', icon: User },
];

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onOpenQR, totalXP = 0, onOpenLogin, onOpenRegister }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletNotifications, setWalletNotifications] = useState<Notification[]>(() => [...defaultWalletNotifications]);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const closeCityModal = useCallback(() => setCityModalOpen(false), []);
  const { city, cityId, setCityId, pickNearestCityFromCoords } = useCity();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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
      <header className={`fixed top-0 left-0 right-0 z-50 w-full px-3 lg:px-5 py-3 lg:py-4 transition-colors duration-300 glass-nav ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 shrink-0">
            <div ref={mobileMenuRef} className="md:hidden relative">
              <BurgerToggle open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />

              {isMobileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Mobile navigation"
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-anbit-border bg-anbit-card px-2 py-2 shadow-xl text-anbit-text mobile-burger-menu"
                >
                  <div className="flex flex-col gap-1">
                    {navPaths.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      const isProfileAsGuest = item.path === "/profile" && !isAuthenticated && onOpenLogin;

                      const itemClass = `flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors ${isActive
                          ? "bg-anbit-text text-anbit-bg"
                          : "text-anbit-muted hover:bg-anbit-border/40 hover:text-anbit-text"
                        }`;

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
                            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
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
                          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isActive ? "text-anbit-bg" : ""}`} />
                          <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                        </NavLink>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-anbit-border flex flex-col gap-2">
                    <div className="px-3 py-1">
                      <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <span className="text-sm font-semibold text-anbit-text">{t("languageSelection")}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        toggleTheme();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-anbit-card border border-anbit-border text-anbit-muted hover:text-anbit-yellow hover:bg-anbit-border/40 transition-colors"
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
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-anbit-border bg-anbit-card text-anbit-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/5 transition-colors"
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
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-anbit-border bg-anbit-card text-anbit-muted hover:text-anbit-yellow hover:bg-anbit-border/40 transition-colors"
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

            <NavLink to="/dashboard" className="logo-anbit cursor-pointer">
              <AnbitWordmark className="text-3xl sm:text-4xl lg:text-5xl" />
            </NavLink>
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className={`flex items-center gap-2 py-2 text-anbit-text transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-anbit-yellow/50 ${theme === 'dark' ? 'hover:text-white/80' : 'hover:text-anbit-yellow'
                }`}
              aria-label="Αλλαγή τοποθεσίας"
              aria-expanded={cityModalOpen}
              aria-haspopup="dialog"
            >
              <MapPin
                className={`w-6 h-6 lg:w-8 lg:h-8 shrink-0 ${theme === 'dark' ? 'text-white' : 'text-anbit-yellow'}`}
                strokeWidth={2}
              />
              <span className="text-sm font-semibold lg:text-base max-w-[120px] truncate">{city.labelEl}</span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${cityModalOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <nav className="hidden md:flex items-center justify-center bg-white/[0.03] border border-anbit-border rounded-full px-2 py-1 gap-1 shrink-0">
              {navPaths.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isProfileAsGuest = item.path === '/profile' && !isAuthenticated && onOpenLogin;
                const baseClass = `relative group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full transition-all ${isActive ? 'bg-anbit-text text-anbit-bg shadow-sm' : 'text-anbit-muted hover:bg-anbit-border/40 hover:text-anbit-text'
                  }`;
                const hoverCardContent = (
                  <div
                    className="nav-hover-card pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-anbit-border bg-anbit-card px-4 py-3 shadow-lg outline-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    <p className="nav-hover-card-text text-center text-sm font-semibold text-anbit-text">
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
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
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
                    <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isActive ? 'text-anbit-bg' : ''}`} />
                    {hoverCardContent}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="md:hidden flex items-center shrink-0">
            {isAuthenticated ? (
              <NotificationPopover
                notifications={walletNotifications}
                onNotificationsChange={setWalletNotifications}
                title={t('notificationsTitle')}
                markAllReadLabel={t('markAllNotificationsRead')}
                bellAriaLabel={t('notificationsBellAria')}
              />
            ) : null}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-lg">
                  <Zap
                    className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-white fill-white' : 'text-anbit-yellow fill-anbit-yellow'}`}
                  />
                  <span className="anbit-tabular-nums text-lg font-bold text-anbit-text tracking-tighter">
                    {totalXP.toLocaleString()} XP
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/[0.05] border border-anbit-border flex items-center justify-center text-anbit-muted hover:text-anbit-yellow transition-colors"
                  aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <NotificationPopover
                  notifications={walletNotifications}
                  onNotificationsChange={setWalletNotifications}
                  title={t('notificationsTitle')}
                  markAllReadLabel={t('markAllNotificationsRead')}
                  bellAriaLabel={t('notificationsBellAria')}
                />
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border border-anbit-border bg-white/[0.03] text-anbit-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/5 transition-colors"
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
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/[0.05] border border-anbit-border flex items-center justify-center text-anbit-muted hover:text-anbit-yellow transition-colors"
                  aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLogin?.()}
                  className="px-4 py-2 text-lg font-semibold text-anbit-text hover:text-anbit-yellow transition-colors"
                >
                  Σύνδεση
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-4 py-2.5 text-lg font-semibold bg-anbit-yellow text-anbit-yellow-content rounded-lg hover:opacity-90 transition-opacity"
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

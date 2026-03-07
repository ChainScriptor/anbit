import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, Star, User, LogOut, Zap, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  isAuthenticated: boolean;
  onOpenQR?: () => void;
  totalXP?: number;
  onOpenLogin?: () => void;
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
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full px-3 lg:px-5 py-3 lg:py-4 transition-colors duration-300 glass-nav ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">

        <div className="flex items-center gap-3 shrink-0">
          <NavLink to="/dashboard" className="logo-anbit text-3xl sm:text-4xl lg:text-5xl cursor-pointer tracking-tight">
            Anbit
          </NavLink>
          <button
            type="button"
            className="flex items-center gap-2 py-2 text-anbit-text hover:text-anbit-yellow transition-colors"
            aria-label="Αλλαγή τοποθεσίας"
          >
            <MapPin className="w-6 h-6 lg:w-8 lg:h-8 text-anbit-yellow shrink-0" strokeWidth={2} />
            <span className="font-greek text-sm lg:text-base font-greek-bold max-w-[120px] truncate">Θεσσαλονίκη</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>
        </div>

        <nav className="flex items-center bg-white/[0.03] border border-anbit-border rounded-xl p-1 overflow-x-auto no-scrollbar scroll-smooth">
          {navPaths.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isProfileAsGuest = item.path === '/profile' && !isAuthenticated && onOpenLogin;
            const baseClass = `flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg transition-all whitespace-nowrap ${isActive ? 'bg-anbit-border text-anbit-text' : 'text-anbit-muted hover:text-anbit-text'
              }`;
            if (isProfileAsGuest) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={onOpenLogin}
                  className={`${baseClass} font-greek`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-lg font-greek-bold tracking-tight normal-case">
                    {t(item.labelKey)}
                  </span>
                </button>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`${baseClass} font-greek`}
              >
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-anbit-yellow' : ''}`} />
                <span className="text-lg font-greek-bold tracking-tight normal-case">
                  {t(item.labelKey)}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-lg">
                <Zap className="w-4 h-4 text-anbit-yellow fill-anbit-yellow" />
                <span className="font-greek text-lg font-greek-bold text-anbit-text tracking-tighter">{totalXP.toLocaleString()} XP</span>
              </div>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/[0.05] border border-anbit-border flex items-center justify-center text-anbit-muted hover:text-anbit-yellow transition-colors"
                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border border-anbit-border bg-white/[0.03] text-anbit-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/5 transition-colors"
                aria-label={t('logout')}
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-greek text-lg font-greek-bold tracking-tight normal-case hidden sm:inline">{t('logout')}</span>
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
                onClick={onOpenLogin}
                className="font-greek px-4 py-2 text-lg font-greek-bold text-anbit-text hover:text-anbit-yellow transition-colors"
              >
                Σύνδεση
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="font-greek px-4 py-2.5 text-lg font-greek-bold bg-anbit-yellow text-anbit-yellow-content rounded-lg hover:opacity-90 transition-opacity"
              >
                Εγγραφή
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

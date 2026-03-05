
import React, { useState, useEffect } from 'react';
import { Home, MapPin, Star, User, LogOut, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQR: () => void;
  totalXP: number;
}

const SCROLL_THRESHOLD = 24;

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, totalXP }) => {
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

  const navItems = [
    { id: 'Dashboard', label: t('dashboard'), icon: Home },
    { id: 'Network', label: t('network'), icon: MapPin },
    { id: 'Quests', label: t('quests'), icon: Star },
    { id: 'Profile', label: t('profile'), icon: User },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full px-3 lg:px-5 py-3 lg:py-4 transition-colors duration-300 glass-nav ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-anbit-yellow rounded-xl flex items-center justify-center shadow-md transform -rotate-3 transition-transform">
            <span className="text-anbit-yellow-content font-black text-xl lg:text-2xl italic">A</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base lg:text-lg font-black italic tracking-tighter leading-none">Anbit</h1>
            <span className="text-[9px] lg:text-[10px] font-medium text-anbit-muted tracking-wide block">Rewards Program</span>
          </div>
        </div>

        <nav className="flex items-center bg-white/[0.03] border border-anbit-border rounded-xl p-1 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg transition-all whitespace-nowrap ${
                  isActive ? 'bg-anbit-border text-anbit-text' : 'text-anbit-muted hover:text-anbit-text'
                }`}
              >
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-anbit-yellow' : ''}`} />
                <span className="text-[11px] lg:text-xs font-medium tracking-tight normal-case">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-2 rounded-lg">
            <Zap className="w-4 h-4 text-anbit-yellow fill-anbit-yellow" />
            <span className="text-xs lg:text-sm font-black text-anbit-text tracking-tighter">{totalXP.toLocaleString()} XP</span>
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
            <span className="text-[11px] lg:text-xs font-medium tracking-tight normal-case hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

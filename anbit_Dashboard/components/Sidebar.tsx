
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  ShoppingCart, 
  CalendarDays, 
  PackageSearch, 
  Megaphone, 
  Settings,
  Store,
  X,
  Users,
  Wallet
} from 'lucide-react';
import { WALLET_URL } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', icon: <BarChart3 size={18} />, label: 'ΕΠΙΣΚΟΠΗΣΗ' },
    { to: '/orders', icon: <ShoppingCart size={18} />, label: 'ΠΑΡΑΓΓΕΛΙΕΣ' },
    { to: '/squad', icon: <CalendarDays size={18} />, label: 'ΚΡΑΤΗΣΕΙΣ' },
    { to: '/customers', icon: <Users size={18} />, label: 'ΠΕΛΑΤΕΣ' },
    { to: '/inventory', icon: <PackageSearch size={18} />, label: 'ΚΑΤΑΛΟΓΟΣ' },
    { to: '/quests', icon: <Megaphone size={18} />, label: 'ΠΡΟΣΦΟΡΕΣ' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-[80px] lg:w-[90px] bg-white border-r border-slate-200 flex flex-col items-center transition-transform duration-300 ease-in-out shadow-card-soft
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-4 flex flex-col items-center gap-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="mx-auto flex items-center justify-center">
              <div className="w-9 h-9 bg-anbit-red rounded-2xl flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="hidden lg:block px-2 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-[0.25em]">Node A-7</span>
          </div>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-3 overflow-y-auto no-scrollbar flex flex-col items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => `
                group relative flex items-center justify-center w-11 h-11 rounded-full transition-all
                ${isActive 
                  ? 'bg-anbit-red text-white scale-[1.05]' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="pointer-events-none absolute left-full ml-3 px-3 py-1 rounded-full bg-slate-900/90 text-[9px] font-medium uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-white space-y-1">
          <a
            href={WALLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 w-full text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors rounded-xl"
          >
            <Wallet size={16} />
            Anbit Wallet
          </a>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-800 w-full text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors group">
            <Settings size={16} className="group-hover:rotate-45 transition-transform" />
            Ρυθμίσεις
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

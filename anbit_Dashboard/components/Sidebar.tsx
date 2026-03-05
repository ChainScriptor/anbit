
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
    fixed inset-y-0 left-0 z-50 w-[240px] bg-[#09090b] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
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
        <div className="p-6 flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-anbit-yellow rounded-lg flex items-center justify-center shadow-glow-yellow">
                <Store size={18} className="text-anbit-dark" />
              </div>
              <span className="font-black text-lg tracking-tighter italic text-white">ANBIT BIZ</span>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-white/40 hover:text-anbit-yellow hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-3 py-1 bg-anbit-yellow/5 rounded border border-anbit-yellow/20">
            <span className="text-[9px] font-black text-anbit-yellow uppercase tracking-widest italic">Node: A-7 COMMAND</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black tracking-widest uppercase italic
                ${isActive 
                  ? 'bg-anbit-yellow text-anbit-dark shadow-glow-yellow scale-[1.02]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20 space-y-1">
          <a
            href={WALLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-anbit-yellow/90 hover:text-anbit-yellow hover:bg-white/5 w-full text-[10px] font-black uppercase tracking-widest italic transition-colors rounded-xl"
          >
            <Wallet size={16} />
            Anbit Wallet
          </a>
          <button className="flex items-center gap-3 px-4 py-3 text-white/30 hover:text-white w-full text-[10px] font-black uppercase tracking-widest italic transition-colors group">
            <Settings size={16} className="group-hover:rotate-45 transition-transform" />
            Ρυθμίσεις
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

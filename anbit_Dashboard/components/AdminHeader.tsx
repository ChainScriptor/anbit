
import React from 'react';
import { Search, Bell, Menu, QrCode } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onVoucherClick: () => void;
}

const AdminHeader: React.FC<HeaderProps> = ({ onMenuClick, onVoucherClick }) => {
  return (
    <header className="h-14 lg:h-16 sticky top-0 flex items-center justify-between px-4 lg:px-6 glass border-b border-white/5 z-40">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        {/* Το Burger button είναι πλέον πάντα διαθέσιμο */}
        <button 
          onClick={onMenuClick} 
          className="p-2 text-anbit-yellow hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-xs hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
          <input 
            type="text" 
            placeholder="Αναζήτηση..." 
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-[11px] focus:outline-none focus:border-anbit-yellow/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={onVoucherClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-anbit-yellow/10 border border-anbit-yellow/20 rounded-lg text-anbit-yellow hover:bg-anbit-yellow/20 transition-all"
        >
          <QrCode size={14} />
          <span className="text-[9px] font-black uppercase tracking-wider hidden sm:block">ΕΞΑΡΓΥΡΩΣΗ</span>
        </button>

        <button className="relative p-2 text-white/30 hidden sm:block hover:text-white transition-colors">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="text-right hidden xl:block leading-none">
            <p className="text-[10px] font-black uppercase tracking-tight">Γ. ΒΑΡΣΟΣ</p>
            <p className="text-[8px] text-anbit-yellow font-bold uppercase tracking-widest mt-0.5">ADMIN</p>
          </div>
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg border border-white/10 overflow-hidden shrink-0">
            <img src="https://picsum.photos/seed/admin/100/100" className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
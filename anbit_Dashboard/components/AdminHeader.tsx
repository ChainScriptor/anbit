
import React from 'react';
import { Search, Bell, Menu, QrCode } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onVoucherClick: () => void;
}

const AdminHeader: React.FC<HeaderProps> = ({ onMenuClick, onVoucherClick }) => {
  return (
    <header className="h-16 sticky top-0 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-slate-200 z-40">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        {/* Το Burger button είναι πλέον πάντα διαθέσιμο */}
        <button 
          onClick={onMenuClick} 
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-xs hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Αναζήτηση..." 
            className="w-full bg-slate-100 border border-transparent rounded-full py-2 pl-9 pr-4 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={onVoucherClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-anbit-red text-white text-[10px] font-semibold hover:brightness-95 transition-all"
        >
          <QrCode size={14} />
          <span className="hidden sm:block">Εξαργύρωση voucher</span>
        </button>

        <button className="relative p-2 text-slate-400 hidden sm:block hover:text-slate-700 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="text-right hidden xl:block leading-none">
            <p className="text-[11px] font-semibold tracking-tight text-slate-900">Γ. ΒΑΡΣΟΣ</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Admin</p>
          </div>
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-slate-200 overflow-hidden shrink-0">
            <img src="https://picsum.photos/seed/admin/100/100" className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
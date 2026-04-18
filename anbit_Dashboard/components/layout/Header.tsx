import React from 'react';
import { Bell, Command, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
        aria-label="Άνοιγμα navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Right side: search + bell */}
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 shadow-sm md:flex">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <Input
            className="h-7 border-0 bg-transparent px-1 text-xs focus-visible:ring-0"
            placeholder="Search"
          />
          <div className="ml-auto flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACCENT = '#e63533';

const ViewSelector: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="md"
              className="gap-2 rounded-xl border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Board View
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Table View</DropdownMenuItem>
            <DropdownMenuItem>Board View</DropdownMenuItem>
            <DropdownMenuItem>Gantt Chart</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="md"
          className="gap-2 rounded-xl border-slate-200 bg-slate-50/80 px-4 py-2 text-sm font-medium text-slate-600"
        >
          This Week
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="md"
              className="gap-2 rounded-xl border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Export
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export CSV</DropdownMenuItem>
            <DropdownMenuItem>Export PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="md"
          className="rounded-xl px-5 py-2 text-sm font-medium text-white shadow-sm"
          style={{ backgroundColor: ACCENT }}
        >
          + Add Orders
        </Button>
      </div>
    </div>
  );
};

export default ViewSelector;


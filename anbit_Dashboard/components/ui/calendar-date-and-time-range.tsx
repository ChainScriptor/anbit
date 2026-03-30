import React from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarDateAndTimeRangeProps {
  date: string;
  fromTime: string;
  toTime: string;
  onDateChange: (value: string) => void;
  onFromTimeChange: (value: string) => void;
  onToTimeChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}

function formatDateLabel(value: string): string {
  if (!value) return 'Select date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('el-GR');
}

export const CalendarDateAndTimeRange: React.FC<CalendarDateAndTimeRangeProps> = ({
  date,
  fromTime,
  toTime,
  onDateChange,
  onFromTimeChange,
  onToTimeChange,
  onClear,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const hasFilters = Boolean(date || fromTime || toTime);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50',
          className,
        )}
      >
        <CalendarDays className="h-4 w-4" />
        <span>
          {date ? formatDateLabel(date) : 'Date & Time'}
          {(fromTime || toTime) && (
            <span className="ml-1 text-slate-500">
              ({fromTime || '--:--'} - {toTime || '--:--'})
            </span>
          )}
        </span>
        {hasFilters && <span className="rounded-full bg-[#E63533] px-2 py-0.5 text-[10px] font-bold text-white">ON</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filter by Date & Time</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="orders-date" className="text-xs font-semibold text-slate-500">
                  Date
                </label>
                <input
                  id="orders-date"
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#E63533]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="orders-time-from" className="text-xs font-semibold text-slate-500">
                    Start time
                  </label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="orders-time-from"
                      type="time"
                      step="1"
                      value={fromTime}
                      onChange={(e) => onFromTimeChange(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#E63533]/20"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="orders-time-to" className="text-xs font-semibold text-slate-500">
                    End time
                  </label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="orders-time-to"
                      type="time"
                      step="1"
                      value={toTime}
                      onChange={(e) => onToTimeChange(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#E63533]/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#E63533] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:brightness-95"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


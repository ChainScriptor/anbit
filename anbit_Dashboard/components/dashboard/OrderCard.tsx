import React from 'react';
import { MoreHorizontal, Check, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface BoardOrder {
  id: string;
  product: string;
  customer: string;
  qty: number;
  price: string;
  date: string;
  imageUrl: string;
}

interface OrderCardProps {
  order: Order;
  columnKey: 'pending' | 'shipped' | 'completed';
  expanded?: boolean;
  onToggleExpand?: () => void;
  onAccept?: (order: Order) => void;
  onDecline?: (order: Order) => void;
  onMarkShipped?: (order: Order) => void;
  onMarkCompleted?: (order: Order) => void;
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Τώρα';
  if (diffMins < 60) return `${diffMins} λεπτά`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ώρ.`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ημ.`;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  columnKey,
  expanded = false,
  onToggleExpand,
  onAccept,
  onDecline,
  onMarkShipped,
  onMarkCompleted,
}) => {
  const firstImage = order.items[0]?.image;
  const itemsSummary =
    order.items.length === 1
      ? order.items[0].name
      : `${order.items.length} προϊόντα`;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onToggleExpand?.();
  };

  return (
    <Card
      className={cn(
        'flex cursor-pointer flex-col rounded-xl border-slate-200 bg-white shadow-sm transition-all',
        expanded && 'ring-2 ring-[#0a0a0a] shadow-md',
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {firstImage ? (
                <img
                  src={firstImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Package className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Τραπέζι {order.tableNumber}
              </p>
              <p className="truncate text-sm text-slate-600">
                {order.customerName}
              </p>
              <p className="text-xs text-slate-400">{itemsSummary}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Ενέργειες"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {columnKey === 'pending' && onAccept && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(order);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Αποδοχή – στείλε πόντους
                  </DropdownMenuItem>
                )}
                {columnKey === 'pending' && onMarkShipped && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkShipped(order);
                    }}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Σημείωσε ως Shipped
                  </DropdownMenuItem>
                )}
                {columnKey === 'shipped' && onMarkCompleted && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkCompleted(order);
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Σημείωσε ως Completed
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-slate-300">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </div>
        </div>

        {!expanded && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="font-medium text-slate-700">
              €{order.totalPrice.toFixed(2)}
            </span>
            <span className="text-slate-500">
              +{order.totalPoints} πόντοι · {formatTimeAgo(order.timestamp)}
            </span>
          </div>
        )}

        {expanded && (
          <div
            className="space-y-4 border-t border-slate-100 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Προϊόντα
            </p>
            <ul className="space-y-2">
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                >
                  {item.image && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {item.name} × {item.qty}
                    </p>
                    <p className="text-xs text-slate-500">
                      €{(item.price * item.qty).toFixed(2)} · +{item.points * item.qty} πόντοι
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <span className="font-semibold text-slate-900">
                Σύνολο: €{order.totalPrice.toFixed(2)}
              </span>
              <span className="text-slate-600">
                +{order.totalPoints} πόντοι · {formatTimeAgo(order.timestamp)}
              </span>
            </div>

            {columnKey === 'pending' && (onAccept || onDecline) && (
              <div className="flex gap-2 pt-2">
                {onAccept && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(order);
                      onToggleExpand?.();
                    }}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#0a0a0a' }}
                  >
                    Αποδοχή
                  </button>
                )}
                {onDecline && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDecline(order);
                      onToggleExpand?.();
                    }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Απόρριψη
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;

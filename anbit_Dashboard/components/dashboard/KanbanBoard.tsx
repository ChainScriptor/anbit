import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import OrderCard from '@/components/dashboard/OrderCard';
import { Order } from '@/types';
import { INITIAL_ORDERS } from '@/constants';
import { cn } from '@/lib/utils';

type ColumnKey = 'pending' | 'shipped' | 'completed';

interface BoardColumnMeta {
  key: ColumnKey;
  title: string;
  accentClass: string;
}

const columnsMeta: BoardColumnMeta[] = [
  { key: 'pending', title: 'Pending', accentClass: 'bg-amber-500/10 text-amber-700' },
  { key: 'shipped', title: 'Shipped', accentClass: 'bg-sky-500/10 text-sky-700' },
  { key: 'completed', title: 'Completed', accentClass: 'bg-emerald-500/10 text-emerald-700' },
];

function orderStatusToColumn(status: Order['status']): ColumnKey | null {
  if (status === 'pending') return 'pending';
  if (status === 'shipped') return 'shipped';
  if (status === 'completed') return 'completed';
  return null; // cancelled - δεν εμφανίζεται στο board
}

const KanbanBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() =>
    INITIAL_ORDERS.filter((o) => o.status !== 'cancelled'),
  );

  const ordersByColumn = useMemo(() => {
    const pending: Order[] = [];
    const shipped: Order[] = [];
    const completed: Order[] = [];
    orders.forEach((o) => {
      const col = orderStatusToColumn(o.status);
      if (col === 'pending') pending.push(o);
      else if (col === 'shipped') shipped.push(o);
      else if (col === 'completed') completed.push(o);
    });
    return { pending, shipped, completed };
  }, [orders]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  const handleAccept = (order: Order) => {
    // Αποδοχή = στέλνουμε πόντους (mock – εδώ μπορείς να καλέσεις API)
    alert(`Πόντοι (${order.totalPoints}) στάλθηκαν στον πελάτη ${order.customerName}.`);
    setExpandedOrderId(null);
  };

  const handleMarkShipped = (order: Order) => {
    updateOrderStatus(order.id, 'shipped');
  };

  const handleMarkCompleted = (order: Order) => {
    updateOrderStatus(order.id, 'completed');
  };

  const handleDecline = (order: Order) => {
    updateOrderStatus(order.id, 'cancelled');
    setExpandedOrderId(null);
  };

  const [dragging, setDragging] = useState<{ order: Order; from: ColumnKey } | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnKey | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleDragStart = (order: Order, from: ColumnKey) => {
    if (expandedOrderId === order.id) return;
    setDragging({ order, from });
  };

  const handleDrop = (to: ColumnKey) => {
    if (!dragging) return;
    const newStatus: Order['status'] =
      to === 'pending' ? 'pending' : to === 'shipped' ? 'shipped' : 'completed';
    updateOrderStatus(dragging.order.id, newStatus);
    setDragging(null);
    setActiveColumn(null);
  };

  return (
    <div className="flex-1 pb-4">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {columnsMeta.map((column) => {
          const list = ordersByColumn[column.key];
          return (
            <Card
              key={column.key}
              className={cn(
                'flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
                activeColumn === column.key && 'ring-2 ring-[#e63533]/30',
              )}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => dragging && setActiveColumn(column.key)}
              onDragLeave={() => setActiveColumn(null)}
              onDrop={() => handleDrop(column.key)}
            >
              <div
                className={cn(
                  'flex items-center justify-between border-b border-slate-100 px-5 py-3.5',
                  column.accentClass,
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold md:text-base">
                    {column.title}
                  </span>
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {list.length}
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-100 px-4 py-2.5">
                <button
                  type="button"
                  className="flex h-9 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-sm font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                >
                  +
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {list.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => {
                      if (expandedOrderId === order.id) {
                        e.preventDefault();
                        return;
                      }
                      if ((e.target as HTMLElement).closest('button')) {
                        e.preventDefault();
                        return;
                      }
                      handleDragStart(order, column.key);
                    }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <OrderCard
                      order={order}
                      columnKey={column.key}
                      expanded={expandedOrderId === order.id}
                      onToggleExpand={() =>
                        setExpandedOrderId((id) => (id === order.id ? null : order.id))
                      }
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onMarkShipped={handleMarkShipped}
                      onMarkCompleted={handleMarkCompleted}
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;

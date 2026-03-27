import React, { useState } from 'react';
import { INITIAL_CUSTOMERS } from '@/constants';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  Mail,
  Wallet,
  Star,
  Clock,
  CreditCard,
  History,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TransactionHistoryModal from '@/components/TransactionHistoryModal';

const ACCENT = '#0a0a0a';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    INITIAL_CUSTOMERS[0]?.id ?? null,
  );
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filteredCustomers = INITIAL_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const selectedCustomer = INITIAL_CUSTOMERS.find(
    (c) => c.id === selectedCustomerId,
  );

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: Customer list panel - sticky */}
        <aside
          className={cn(
            'flex w-full shrink-0 flex-col rounded-2xl border border-slate-200 bg-white',
            'lg:sticky lg:top-0 lg:h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-6rem)] lg:w-72',
          )}
        >
          <div className="shrink-0 border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Customers</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {filteredCustomers.length} total
            </p>
          </div>
          <div className="shrink-0 px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filteredCustomers.map((customer) => {
              const isActive = selectedCustomerId === customer.id;
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isActive ? 'text-white' : 'text-slate-700 hover:bg-slate-100',
                  )}
                  style={
                    isActive ? { backgroundColor: ACCENT } : undefined
                  }
                >
                  <div
                    className={cn(
                      'h-10 w-10 shrink-0 overflow-hidden rounded-full border-2',
                      isActive ? 'border-white/40' : 'border-slate-200',
                    )}
                  >
                    <img
                      src={customer.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{customer.name}</p>
                    <p
                      className={cn(
                        'text-xs',
                        isActive ? 'text-white' : 'text-slate-500',
                      )}
                    >
                      €{customer.totalSpent.toFixed(0)} · {customer.loyaltyPoints} pts
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Banner + selected customer detail */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Banner */}
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
            style={{
              background:
                'linear-gradient(135deg, #fef3e2 0%, #fde8d4 50%, #fad9b8 100%)',
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Manage Your Customers
                </h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
                  View spending, loyalty points, visits and preferences for each customer.
                </p>
              </div>
              <div className="mt-4 flex justify-center md:mt-0 md:block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-5xl shadow-sm md:h-28 md:w-28">
                  👥
                </div>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-12 opacity-30"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' fill='none'%3E%3Cpath d='M0 40 Q360 0 720 40 T1440 40 V80 H0 Z' fill='%23e63533'/%3E%3C/svg%3E") no-repeat bottom center`,
                backgroundSize: 'cover',
              }}
            />
          </div>

          {selectedCustomer ? (
            <div className="flex flex-col gap-6">
              {/* Profile hero */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100">
                    <img
                      src={selectedCustomer.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
                      {selectedCustomer.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 shrink-0" />
                      {selectedCustomer.email}
                    </div>
                    {/* KPIs row */}
                    <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Συνολική δαπάνη
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          €{selectedCustomer.totalSpent.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Πόντοι Loyalty
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {selectedCustomer.loyaltyPoints}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Επισκέψεις
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {selectedCustomer.totalOrders}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Habits & schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
                    Συνηθείες καταναλωσης
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-lg p-2"
                          style={{ backgroundColor: `${ACCENT}15` }}
                        >
                          <Clock className="h-4 w-4" style={{ color: ACCENT }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Ωράριο αιχμής
                          </p>
                          <p className="font-semibold text-slate-900">
                            {selectedCustomer.visitFrequency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500">
                          Τελευταία επισκεψη
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {selectedCustomer.lastVisit}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Προϊόντα προτιμήσεων
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.preferredItems.map((item, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <MessageSquare className="h-4 w-4" style={{ color: ACCENT }} />
                    Κριτικές πελάτη
                  </div>
                  <div className="mt-4 space-y-3">
                    {selectedCustomer.reviews.length > 0 ? (
                      selectedCustomer.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < review.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200',
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-sm italic text-slate-600">
                            "{review.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Δεν υπάρχουν κριτικές ακόμα.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="gap-2 text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Προσθήκη Loyalty Πόντων
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    <History className="h-4 w-4" />
                    Ιστορικό Συναλλαγών
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
              <Users className="h-14 w-14" />
              <p className="mt-3 text-sm font-medium">Επιλέξτε πελάτη</p>
            </div>
          )}
        </div>
      </div>

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customer={selectedCustomer ?? null}
      />
    </div>
  );
};

export default Customers;

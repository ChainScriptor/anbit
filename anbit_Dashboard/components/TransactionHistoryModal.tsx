
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  History, 
  Calendar as CalendarIcon, 
  Clock, 
  ShoppingBag, 
  ChevronRight,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Customer, Transaction } from '../types';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ isOpen, onClose, customer }) => {
  const [viewDate, setViewDate] = useState(new Date());

  if (!customer) return null;

  // Helper to check if a day has transactions
  const hasTransactionOnDate = (day: number, month: number, year: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return customer.transactions.some(t => t.date === dateString);
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0 is Sunday in JS, we want 1 to be Mon)
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('el-GR', { month: 'long' });
  const year = viewDate.getFullYear();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-anbit-dark/95 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl glass border border-white/10 rounded-heavy shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-anbit-yellow/10 rounded-2xl border border-anbit-yellow/20">
                  <History className="text-anbit-yellow" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Πληρες Ιστορικο & Δραστηριοτητα</h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{customer.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT SIDE: CALENDAR HEATMAP */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="glass-tactical p-5 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{monthName} {year}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40"><ChevronLeft size={16} /></button>
                        <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40"><ChevronRightIcon size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ'].map(d => (
                        <div key={d} className="text-center text-[8px] font-black text-white/20 pb-2">{d}</div>
                      ))}
                      {calendarDays.map((day, idx) => {
                        const isVisited = day !== null && hasTransactionOnDate(day, viewDate.getMonth(), viewDate.getFullYear());
                        return (
                          <div 
                            key={idx} 
                            className={`
                              aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg transition-all
                              ${day === null ? 'opacity-0' : 'hover:bg-white/5'}
                              ${isVisited ? 'bg-anbit-yellow text-anbit-dark shadow-glow-yellow' : 'text-white/40'}
                            `}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded bg-anbit-yellow shadow-glow-yellow" />
                        <span className="text-[8px] font-bold text-white/40 uppercase">Επισκεψη</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded bg-white/5" />
                        <span className="text-[8px] font-bold text-white/40 uppercase">Καμια Δραστηριοτητα</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-tactical p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-anbit-cyan uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={14} /> Στατιστικα Πελατη
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white/20 uppercase">Συνολικες Αγορες</span>
                        <span className="text-sm font-black italic text-white">{customer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white/20 uppercase">Μεση Δαπανη</span>
                        <span className="text-sm font-black italic text-anbit-green">€{(customer.totalSpent / (customer.totalOrders || 1)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white/20 uppercase">Loyalty Points</span>
                        <span className="text-sm font-black italic text-anbit-yellow">{customer.loyaltyPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: TRANSACTION LIST */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                    <ShoppingBag size={12} /> Αναλυτικη Λιστα Συναλλαγων
                  </h3>
                  
                  <div className="space-y-3">
                    {customer.transactions && customer.transactions.length > 0 ? (
                      customer.transactions.map((t) => (
                        <div key={t.id} className="glass-tactical border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-anbit-yellow/5 rounded-full blur-3xl -mr-12 -mt-12" />
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex gap-4">
                              <div className="p-3 bg-white/5 rounded-xl text-white/40 group-hover:text-anbit-yellow transition-colors shrink-0">
                                <Clock size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black uppercase text-white/80 italic">{t.date}</span>
                                  <span className="text-[10px] font-bold text-white/20">|</span>
                                  <span className="text-[10px] font-mono font-bold text-anbit-yellow">{t.time}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {t.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                      <span className="text-[9px] font-black text-anbit-cyan">{item.qty}x</span>
                                      <span className="text-[9px] font-bold text-white/60 uppercase">{item.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-black italic text-anbit-green leading-none">€{t.totalSpent.toFixed(2)}</div>
                              <div className="text-[9px] font-bold text-anbit-yellow uppercase mt-1">+{t.pointsEarned} Π</div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                             <span className="text-[8px] font-bold text-white/20 uppercase font-mono tracking-tighter">REF: {t.id}</span>
                             <button className="text-anbit-cyan text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                               Προβολη Αποδειξης <ChevronRight size={10} />
                             </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/5 rounded-2xl">
                        <History size={48} />
                        <span className="text-[10px] font-black uppercase mt-4 tracking-widest">Μηδενικη Δραστηριοτητα</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-anbit-cyan" />
                    Status: <span className="text-white italic">ΠΙΣΤΟΣ ΠΕΛΑΤΗΣ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-anbit-yellow" />
                    Reward Tier: <span className="text-anbit-gold">GOLD CLASS</span>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Εξαγωγη PDF</button>
                   <button className="px-4 py-2 bg-anbit-yellow text-anbit-dark rounded-lg text-[10px] font-black uppercase tracking-widest shadow-glow-yellow transition-all hover:scale-105">Αποστολη Bonus</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionHistoryModal;

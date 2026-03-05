
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Wallet, 
  Clock, 
  Star, 
  MessageSquare,
  TrendingUp,
  Layout,
  CreditCard,
  Mail,
  Calendar,
  History
} from 'lucide-react';
import { INITIAL_CUSTOMERS } from '../constants';
import { Customer } from '../types';
import TransactionHistoryModal from '../components/TransactionHistoryModal';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(INITIAL_CUSTOMERS[0].id);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filteredCustomers = INITIAL_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = INITIAL_CUSTOMERS.find(c => c.id === selectedCustomerId);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 lg:overflow-hidden animate-in fade-in duration-500">
      {/* LEFT: CUSTOMER LIST */}
      <div className="lg:w-1/3 flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-anbit-yellow font-black italic text-xl tracking-tighter uppercase neon-text-glow-yellow">Βαση Πελατων</h2>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{filteredCustomers.length} Συνολο</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
          <input 
            type="text" 
            placeholder="Αναζήτηση Πελάτη..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-anbit-yellow outline-none transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id)}
              className={`
                glass-tactical p-3 rounded-xl cursor-pointer transition-all border-l-4 flex items-center gap-4
                ${selectedCustomerId === customer.id 
                  ? 'border-anbit-yellow bg-anbit-yellow/5' 
                  : 'border-white/5 opacity-60 hover:opacity-100'}
              `}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                <img src={customer.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-white/90 truncate">{customer.name}</span>
                  <span className="text-[10px] font-mono font-bold text-anbit-yellow">€{customer.totalSpent.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{customer.loyaltyPoints} Πόντοι</span>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{customer.totalOrders} Παρ.</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: CUSTOMER ANALYTICS */}
      <div className="lg:w-2/3 flex flex-col gap-6 h-full">
        {selectedCustomer ? (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
            
            {/* PROFILE HERO */}
            <div className="glass-tactical rounded-heavy p-6 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl border-4 border-anbit-yellow/20 shadow-glow-yellow p-1 bg-anbit-dark">
                  <img src={selectedCustomer.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">{selectedCustomer.name}</h1>
                  <div className="flex items-center gap-2 text-xs font-mono text-white/40 mt-1 uppercase tracking-tight">
                    <Mail size={12} className="text-anbit-cyan" /> {selectedCustomer.email}
                  </div>
                  
                  <div className="flex gap-8 mt-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Συνολικη Δαπανη</span>
                      <span className="text-2xl font-black italic text-anbit-green leading-none">€{selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5 self-center" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Ποντοι Loyalty</span>
                      <span className="text-2xl font-black italic text-anbit-yellow leading-none">{selectedCustomer.loyaltyPoints}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5 self-center" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Επισκεψεις</span>
                      <span className="text-2xl font-black italic text-anbit-cyan leading-none">{selectedCustomer.totalOrders}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HABITS & SCHEDULE */}
              <div className="glass-tactical rounded-heavy p-6 space-y-6">
                <div className="flex items-center gap-2 text-anbit-cyan font-black italic uppercase text-xs">
                  <TrendingUp size={16} /> Συνηθειες Καταναλωσης
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-anbit-cyan/10 rounded-lg text-anbit-cyan">
                        <Clock size={16} />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Ωραριο Αιχμης</span>
                        <span className="text-sm font-black italic text-white uppercase">{selectedCustomer.visitFrequency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Τελευταια Επισκεψη</span>
                       <span className="text-[10px] font-bold text-white/60">{selectedCustomer.lastVisit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-3">Προϊοντα Προτιμησης</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.preferredItems.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-anbit-yellow/80 uppercase">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FEEDBACK & REVIEWS */}
              <div className="glass-tactical rounded-heavy p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-anbit-yellow font-black italic uppercase text-xs">
                    <MessageSquare size={16} /> Κριτικες Πελατη
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCustomer.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < review.rating ? "text-anbit-gold fill-anbit-gold" : "text-white/10"} 
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-bold text-white/20 uppercase">{review.date}</span>
                      </div>
                      <p className="text-[10px] text-white/60 font-medium italic leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK BUSINESS ACTIONS */}
            <div className="glass-tactical rounded-heavy p-6">
              <div className="flex items-center gap-4">
                <button className="flex-1 h-14 bg-anbit-yellow text-anbit-dark rounded-xl flex items-center justify-center gap-2 font-black italic uppercase text-xs shadow-glow-yellow transition-all hover:scale-[1.02] active:scale-95">
                  <CreditCard size={18} /> Προσθηκη Loyalty Ποντων
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 font-black italic uppercase text-xs text-white/60 hover:bg-white/10 transition-all"
                >
                  <History size={18} /> Ιστορικο Συναλλαγων
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <Users size={64} />
            <span className="text-[10px] font-black uppercase tracking-[1em] mt-4">Επιλεξτε Πελατη</span>
          </div>
        )}
      </div>

      <TransactionHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        customer={selectedCustomer || null}
      />
    </div>
  );
};

export default Customers;

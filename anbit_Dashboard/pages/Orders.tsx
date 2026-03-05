
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Zap,
  TrendingUp,
  Target,
  Coins,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  Activity,
  CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip 
} from 'recharts';
import { INITIAL_ORDERS, REVENUE_HISTORY } from '../constants';
import { Order } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS.filter(o => o.status === 'pending'));
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleDeploy = () => {
    if (!selectedOrderId) return;
    setIsDeploying(true);
    
    setTimeout(() => {
      setOrders(prev => prev.filter(o => o.id !== selectedOrderId));
      setIsDeploying(false);
      setSelectedOrderId(null);
    }, 800);
  };

  const handleDecline = () => {
    if (!selectedOrderId) return;
    setIsDeclining(true);
    
    setTimeout(() => {
      setOrders(prev => prev.filter(o => o.id !== selectedOrderId));
      setIsDeclining(false);
      setSelectedOrderId(null);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 lg:overflow-hidden animate-in fade-in duration-500">
      {/* LEFT: LIVE FEED */}
      <div className="lg:w-1/3 flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-anbit-yellow font-black italic text-xl tracking-tighter uppercase neon-text-glow-yellow">Ζωντανη Ροη</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-anbit-yellow rounded-full animate-pulse shadow-glow-yellow" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Κομβος Ενεργος</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  filter: isDeclining && selectedOrderId === order.id ? 'grayscale(1) blur(10px)' : 'blur(10px)' 
                }}
                onClick={() => setSelectedOrderId(order.id)}
                className={`
                  glass-tactical p-4 rounded-lg cursor-pointer transition-all border-l-4 
                  ${selectedOrderId === order.id 
                    ? 'border-anbit-yellow scale-[1.02] shadow-glow-yellow bg-anbit-yellow/5' 
                    : 'border-white/10 opacity-60 hover:opacity-100'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-anbit-yellow uppercase tracking-widest mb-0.5">Τραπεζι {order.tableNumber}</span>
                    <span className="text-xs font-bold text-white/80">{order.customerName}</span>
                  </div>
                  <span className="text-[8px] font-black text-anbit-gold/60 uppercase px-1.5 py-0.5 bg-anbit-gold/5 border border-anbit-gold/10 rounded tracking-widest">ΕΚΚΡΕΜΕΙ</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-[9px] text-white/20 uppercase font-bold tracking-wider">
                    <Clock size={10} /> πριν 12λ
                  </div>
                  <span className="text-[10px] font-mono font-black text-anbit-yellow tracking-tighter">+{order.totalPoints} Πόντοι</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: COMMAND CENTER */}
      <div className="lg:w-2/3 flex flex-col gap-6 h-full">
        <div className={`glass-tactical flex-1 rounded-heavy flex flex-col p-6 relative overflow-hidden transition-all duration-300 ${isDeclining ? 'bg-red-500/5 border-red-500/20' : ''}`}>
          <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header restored */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${isDeclining ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-anbit-yellow/10 border-anbit-yellow/20 text-anbit-yellow'}`}>
                  {isDeclining ? <ShieldAlert size={24} /> : <Target size={24} />}
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tighter uppercase italic transition-colors ${isDeclining ? 'text-red-500' : 'text-white neon-text-glow-yellow'}`}>
                    {selectedOrder ? `Στοχος: Τραπεζι ${selectedOrder.tableNumber}` : "Απωλεια Σηματος"}
                  </h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    {selectedOrder ? (
                      <><Activity size={10} className="text-anbit-cyan" /> {selectedOrder.customerName}</>
                    ) : "Αναμονή ροής δεδομένων..."}
                  </p>
                </div>
              </div>
              {selectedOrder && (
                <div className="text-right">
                  <div className={`text-[18px] font-black italic leading-none ${isDeclining ? 'text-red-400' : 'text-anbit-yellow'}`}>€{selectedOrder.totalPrice.toFixed(2)}</div>
                  <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Συνολικο Φορτιο</div>
                </div>
              )}
            </div>

            {/* List with images restored */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 px-2 mb-8">
              <AnimatePresence mode="wait">
                {selectedOrder ? (
                  <motion.div 
                    key={selectedOrder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group transition-colors ${isDeclining ? 'hover:border-red-500/20' : 'hover:border-anbit-yellow/20'}`}>
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                           <img src={item.image} className={`w-full h-full object-cover grayscale transition-all ${isDeclining ? 'opacity-30' : 'group-hover:grayscale-0'}`} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black uppercase tracking-tight text-white/80">
                              {item.qty}x {item.name}
                            </h4>
                            <span className={`text-[10px] font-mono font-black ${isDeclining ? 'text-red-500/30' : 'text-anbit-yellow'}`}>+{item.points * item.qty} Πόντοι</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] font-bold text-white/20 uppercase">Κοστος Μοναδας: €{item.price.toFixed(2)}</span>
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-tight">Ισχυς Ποντων: {item.points} Π</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-5">
                    <ShieldAlert size={64} />
                    <span className="text-[10px] font-black uppercase tracking-[1em] mt-4">Εκτος Συνδεσης</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary restored */}
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col items-center">
              {selectedOrder && (
                <div className="flex w-full justify-around mb-8 px-8">
                   <div className="text-center">
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Κατανομη Ποντων</div>
                      <div className={`text-3xl font-black italic font-mono tracking-tighter ${isDeclining ? 'text-red-500/40 line-through' : 'text-anbit-yellow'}`}>+{selectedOrder.totalPoints}</div>
                   </div>
                   <div className="w-px h-12 bg-white/5 self-center" />
                   <div className="text-center">
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Συνολικο Ποσο</div>
                      <div className={`text-3xl font-black italic font-mono tracking-tighter ${isDeclining ? 'text-red-500/40' : 'text-anbit-gold'}`}>€{selectedOrder.totalPrice.toFixed(2)}</div>
                   </div>
                </div>
              )}

              <div className="w-full max-w-sm space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeploy}
                  disabled={!selectedOrderId || isDeploying || isDeclining}
                  className={`
                    relative w-full h-16 rounded-xl border flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden group
                    ${selectedOrderId && !isDeclining
                      ? 'border-anbit-yellow/30 bg-anbit-yellow text-anbit-dark shadow-glow-yellow font-black cursor-pointer' 
                      : 'border-white/5 bg-white/5 text-white/10 cursor-not-allowed'}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  {isDeploying ? (
                    <Zap size={24} className="animate-ping" />
                  ) : (
                    <>
                      <Zap size={20} className={selectedOrderId && !isDeclining ? "animate-pulse" : ""} />
                      <span className="text-sm font-black italic tracking-[0.2em] uppercase">ΕΓΚΡΙΣΗ & ΑΠΟΣΤΟΛΗ ΠΟΝΤΩΝ</span>
                      <Coins size={18} className="opacity-40" />
                    </>
                  )}
                </motion.button>

                {selectedOrderId && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDecline}
                    disabled={isDeploying || isDeclining}
                    className={`
                      w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500/60 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all
                      ${isDeclining ? 'opacity-50 cursor-wait' : 'hover:bg-red-500/10 hover:border-red-500 hover:text-red-500'}
                    `}
                  >
                    {isDeclining ? <AlertTriangle size={14} className="animate-pulse" /> : <XCircle size={14} />}
                    {isDeclining ? 'ΜΑΤΑΙΩΣΗ...' : 'ΑΠΟΡΡΙΨΗ ΜΕΤΑΔΟΣΗΣ'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ANALYTICS restored */}
        <div className="h-40 glass-tactical rounded-heavy p-5 flex items-center gap-8 shrink-0">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-anbit-cyan font-black italic uppercase text-xs">
              <TrendingUp size={16} /> Οικονομικη Νοημοσυνη
            </div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-relaxed">
              Η συχνότητα παραγγελιών αυξήθηκε κατά <span className="text-anbit-cyan">22%</span>. Τα κίνητρα πόντων επιτυγχάνουν <span className="text-white">βέλτιστο ROI</span>.
            </p>
          </div>
          <div className="w-48 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_HISTORY}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{backgroundColor: '#09090b', border: 'none', borderRadius: '8px', fontSize: '10px'}} />
                <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;

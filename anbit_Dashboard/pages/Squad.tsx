
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, UserPlus, Check, X, Clock } from 'lucide-react';
import { INITIAL_BOOKINGS } from '../constants';

const Squad: React.FC = () => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  const updateStatus = (id: string, status: any) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Κρατήσεις & Ραντεβού</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Ημερήσιο πλάνο προσέλευσης πελατών</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-anbit-yellow text-anbit-dark rounded-lg text-[11px] font-black uppercase tracking-wider shadow-glow-yellow active:scale-95 transition-all">
          <UserPlus size={16} /> Νέα Κράτηση
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className={`glass-tactical p-5 rounded-card border-t-2 transition-all ${
            booking.status === 'arrived' ? 'border-anbit-yellow bg-anbit-yellow/5' : 'border-white/5'
          }`}>
            <div className="flex justify-between items-start mb-4">
               <div>
                 <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter block mb-1">ΩΡΑ ΠΡΟΣΕΛΕΥΣΗΣ</span>
                 <h4 className="text-lg font-black italic flex items-center gap-2">
                    <Clock size={16} className="text-anbit-yellow" /> {booking.time}
                 </h4>
               </div>
               <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                 booking.status === 'upcoming' ? 'bg-white/5 text-white/40' : 'bg-anbit-yellow/20 text-anbit-yellow'
               }`}>
                 {booking.status === 'upcoming' ? 'ΕΚΚΡΕΜΕΙ' : 'ΠΡΟΣΗΛΘΕ'}
               </span>
            </div>
            
            <h3 className="text-sm font-bold uppercase mb-1 text-white/90">{booking.customerName}</h3>
            <p className="text-[10px] text-white/30 uppercase font-medium">Άτομα: {booking.squadSize} | Τύπος: {booking.missionType}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-6">
               <button 
                onClick={() => updateStatus(booking.id, 'arrived')}
                disabled={booking.status === 'arrived'}
                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all ${
                  booking.status === 'arrived' 
                  ? 'bg-anbit-yellow/20 text-anbit-yellow/40 cursor-default' 
                  : 'bg-anbit-yellow text-anbit-dark shadow-glow-yellow'
                }`}
               >
                 ΑΦΙΞΗ
               </button>
               <button 
                onClick={() => updateStatus(booking.id, 'completed')}
                className="py-2 bg-white/5 text-white/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
               >
                 ΟΛΟΚΛΗΡΩΣΗ
               </button>
            </div>
          </div>
        ))}
        
        {bookings.length === 0 && (
          <div className="col-span-full h-40 glass-tactical border-dashed border-2 border-white/5 rounded-card flex flex-col items-center justify-center opacity-20">
            <Calendar size={32} />
            <span className="text-[10px] font-black uppercase mt-2 tracking-[0.3em]">Δεν υπαρχουν κρατησεις</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;

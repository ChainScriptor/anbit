
import React from 'react';
import { Flame, Megaphone, Plus, Timer, Trash2 } from 'lucide-react';
import { INITIAL_QUESTS } from '../constants';

const Quests: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Προωθητικές Ενέργειες</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Διαχείριση προσφορών και καμπανιών loyalty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass p-6 rounded-card border-anbit-yellow/20 self-start">
           <h3 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2">
             <Plus size={16} className="text-anbit-yellow" /> ΝΕΑ ΠΡΟΣΦΟΡΑ
           </h3>
           <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Τίτλος Καμπάνιας</label>
                 <input type="text" placeholder="Π.χ. Morning Happy Hour" className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-[11px] focus:border-anbit-yellow outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Πολλαπλασιαστής Πόντων</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-[11px] outline-none">
                       <option>x1.5</option>
                       <option>x2.0</option>
                       <option>x3.0</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Διάρκεια (Ωρες)</label>
                    <input type="number" placeholder="2" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px]" />
                 </div>
              </div>
              <button className="w-full py-3 bg-anbit-yellow text-anbit-dark rounded-lg text-[10px] font-black uppercase tracking-widest mt-4 shadow-sm active:scale-95 transition-all">
                 Ενεργοποίηση Καμπάνιας
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Ενεργές Καμπάνιες</h3>
          {INITIAL_QUESTS.map(q => (
            <div key={q.id} className="glass p-5 rounded-card border-l-4 border-anbit-yellow flex justify-between items-center group">
               <div className="flex gap-4 items-center">
                  <div className="p-2.5 bg-anbit-yellow/10 rounded-lg border border-anbit-yellow/20 text-anbit-yellow">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase">{q.title}</h4>
                    <p className="text-[10px] text-white/30 mt-0.5">{q.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[9px] font-bold text-anbit-cyan flex items-center gap-1">
                          <Timer size={10} /> 02:45:12 υπολειπόμενα
                       </span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <span className="text-lg font-black italic text-anbit-yellow">{q.multiplier}x</span>
                     <p className="text-[8px] font-bold text-white/20 uppercase">Loyalty Boost</p>
                  </div>
                  <button className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quests;

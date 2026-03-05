
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  ArrowUpRight,
  Wallet,
  CalendarCheck,
  Star
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { REVENUE_HISTORY } from '../constants';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Πίνακας Ελέγχου</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
            Επισκόπηση επιδόσεων καταστήματος σε πραγματικό χρόνο
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-white/20 uppercase">Κατάσταση</span>
             <span className="text-xs font-bold text-anbit-green uppercase flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-anbit-green rounded-full animate-pulse"></div> Συνδεδεμένο
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ΗΜΕΡΗΣΙΟΣ ΤΖΙΡΟΣ", value: "€2.105", sub: "+12.5%", icon: <Wallet size={16}/>, color: "text-anbit-green" },
          { label: "ΠΟΝΤΟΙ LOYALTY", value: "48.250", sub: "320 κινήσεις", icon: <Star size={16}/>, color: "text-anbit-yellow" },
          { label: "ΕΝΕΡΓΟΙ ΠΕΛΑΤΕΣ", value: "142", sub: "Σε αναμονή: 4", icon: <Users size={16}/>, color: "text-anbit-cyan" },
          { label: "ΜΕΣΗ ΚΑΤΑΝΑΛΩΣΗ", value: "€14.82", sub: "Σταθερή", icon: <CreditCard size={16}/>, color: "text-anbit-yellow" }
        ].map((metric, i) => (
          <div key={i} className="glass p-4 rounded-card">
            <div className="flex justify-between items-start mb-3 text-white/20">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5">{metric.icon}</div>
            </div>
            <p className="text-[9px] font-bold text-white/40 tracking-wider uppercase mb-1">{metric.label}</p>
            <h3 className={`text-xl font-black tracking-tight ${metric.color}`}>{metric.value}</h3>
            <p className="text-[8px] font-medium text-white/20 uppercase mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="glass p-6 rounded-heavy">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-anbit-cyan" /> Ροή Εσόδων (24h)
          </h3>
          <div className="flex gap-1">
            {['24Ω', '7Η', '30Η'].map(p => (
              <button key={p} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-bold rounded-full hover:bg-white/10 transition-all">{p}</button>
            ))}
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_HISTORY}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px'}}
              />
              <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2} fill="rgba(34, 211, 238, 0.05)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

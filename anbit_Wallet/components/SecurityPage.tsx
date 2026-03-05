
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Smartphone, MapPin, AlertCircle, Fingerprint, Activity } from 'lucide-react';
import { UserData } from '../types';
import { containerVariants, itemVariants } from '../constants';

const SecurityPage: React.FC<{ user: UserData }> = ({ user }) => {
  const [ghostMode, setGhostMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const activeNodes = [
    { device: 'iPhone 15 Pro', location: 'Thessaloniki, GR', status: 'Active Node', time: 'Just now' },
    { device: 'MacBook Pro 16', location: 'Thessaloniki, GR', status: 'Standby', time: '4 hours ago' },
  ];

  return (
    <motion.div 
      className="space-y-8 lg:space-y-12 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section - Scaled */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-anbit-yellow rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-anbit-yellow-content" />
          </div>
          <span className="text-[10px] font-black text-anbit-yellow uppercase tracking-[0.4em]">Classified Hub</span>
        </div>
        <h2 className="text-3xl lg:text-5xl font-black text-white leading-none tracking-tighter uppercase italic">
          Security <span className="text-anbit-yellow">Protocols</span>
        </h2>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Core Security */}
        <div className="xl:col-span-7 space-y-6 lg:space-y-8">
          <div className="dashboard-card p-6 lg:p-8 space-y-6 border-anbit-yellow/10">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-anbit-yellow" />
              <h3 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter">Bio-Identity Lock</h3>
            </div>

            <div className="flex items-center justify-between gap-6 p-4 bg-black/40 border border-white/5 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-sm font-black text-white uppercase italic">Two-Factor Auth</span>
                <p className="text-[10px] text-anbit-muted font-medium italic leading-tight">Biometric scan required for Vault redemption.</p>
              </div>
              <button 
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-10 h-5 rounded-full relative transition-all shrink-0 ${twoFactor ? 'bg-anbit-yellow' : 'bg-anbit-border'}`}
              >
                <motion.div 
                  animate={{ x: twoFactor ? 20 : 4 }}
                  className={`absolute top-1 w-3 h-3 rounded-full ${twoFactor ? 'bg-black' : 'bg-anbit-muted'}`}
                />
              </button>
            </div>

            <div className="space-y-3">
               <span className="text-[8px] font-black text-anbit-muted uppercase tracking-widest block">Recovery Codes</span>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {['X72-B9A', 'L21-P90', 'K08-Z12', 'V44-M33'].map(code => (
                    <div key={code} className="bg-white/[0.03] border border-white/10 p-2 rounded-lg text-center font-mono font-bold text-[10px] text-anbit-yellow/60">
                      {code}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="dashboard-card p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-anbit-yellow" />
              <h3 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter">Active Tactical Nodes</h3>
            </div>

            <div className="space-y-3">
              {activeNodes.map((node, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl group hover:border-anbit-yellow/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-anbit-yellow/5 rounded-lg">
                      <Smartphone className="w-4 h-4 text-anbit-yellow" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block truncate">{node.device}</span>
                      <span className="text-[8px] font-bold text-anbit-muted uppercase flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {node.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-anbit-yellow uppercase block">{node.status}</span>
                    <span className="text-[8px] font-bold text-anbit-muted">{node.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Privacy Matrix */}
        <div className="xl:col-span-5 space-y-6 lg:space-y-8">
          <div className="dashboard-card p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-anbit-yellow" />
              <h3 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter">Privacy Matrix</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white uppercase italic">Ghost Mode</span>
                  <p className="text-[9px] font-bold text-anbit-muted max-w-[180px]">Invisible to other warriors and boards.</p>
                </div>
                <button 
                  onClick={() => setGhostMode(!ghostMode)}
                  className={`w-10 h-5 rounded-full relative transition-all shrink-0 ${ghostMode ? 'bg-anbit-yellow' : 'bg-anbit-border'}`}
                >
                  <motion.div 
                    animate={{ x: ghostMode ? 20 : 4 }}
                    className={`absolute top-1 w-3 h-3 rounded-full ${ghostMode ? 'bg-black' : 'bg-anbit-muted'}`}
                  />
                </button>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="space-y-3">
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Data Leak Prevention</span>
                 <div className="space-y-2.5">
                   {['Share analytics with HQ', 'Allow partner lookup', 'Display rank to friends'].map((item, idx) => (
                     <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-anbit-yellow rounded bg-transparent border-anbit-border" />
                        <span className="text-[10px] font-bold text-anbit-muted group-hover:text-white transition-colors italic leading-none">{item}</span>
                     </label>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-red-500/5 border border-dashed border-red-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-3 text-red-500">
               <AlertCircle className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">Self-Destruct</span>
            </div>
            <p className="text-[9px] font-bold text-anbit-muted leading-relaxed">Irreversible wipe of all biometric and XP history.</p>
            <button className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-white transition-all">
              Initiate Wipe
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityPage;

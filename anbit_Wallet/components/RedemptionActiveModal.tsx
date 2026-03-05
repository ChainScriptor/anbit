
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Clock, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

interface RedemptionActiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardName: string;
  partnerName: string;
}

const RedemptionActiveModal: React.FC<RedemptionActiveModalProps> = ({ 
  isOpen, 
  onClose, 
  rewardName, 
  partnerName 
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [redemptionCode] = useState('X7K-9B2');

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop with dense blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-anbit-bg/95 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm z-[302]"
          >
            <div className="dashboard-card bg-anbit-card p-6 sm:p-8 flex flex-col space-y-6 relative overflow-hidden border-anbit-yellow/20 shadow-2xl">
              
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-anbit-yellow shadow-[0_0_15px_rgba(254,240,138,0.3)]" />

              <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-full text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Compact Header */}
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-anbit-yellow" />
                  <span className="text-[8px] font-black text-anbit-yellow uppercase tracking-[0.4em]">Tactical Clearance</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase leading-tight">
                  Redemption <span className="text-anbit-yellow">Manifest</span>
                </h3>
                <p className="text-[10px] text-anbit-muted font-bold italic truncate px-2">{rewardName} • {partnerName}</p>
              </div>

              {/* Central Code & QR - Balanced Sizes */}
              <div className="flex flex-col items-center space-y-5">
                <div className="relative">
                  <div className="absolute -inset-6 bg-anbit-yellow/5 rounded-full blur-2xl" />
                  <h2 className="text-5xl sm:text-6xl font-black text-anbit-yellow tracking-tighter italic leading-none relative z-10 select-none drop-shadow-[0_0_20px_rgba(254,240,138,0.2)]">
                    {redemptionCode}
                  </h2>
                </div>

                <div className="relative bg-white p-3 rounded-2xl border-4 border-anbit-yellow/10 shadow-xl overflow-hidden group">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=REDEMPTION_${redemptionCode}&color=000000&bgcolor=ffffff`} 
                    alt="Redemption QR"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                  />
                  <div className="absolute inset-0 bg-anbit-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Timer Section - Leaner */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-anbit-muted uppercase tracking-widest">
                  <Clock className="w-3 h-3 text-anbit-yellow" /> Time Window
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center">
                  <span className="text-3xl font-black text-white italic tracking-tighter font-mono leading-none">
                    {formatTime(timeLeft)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 text-red-500/80">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Present to merchant now</span>
                  </div>
                </div>
              </div>

              {/* Compact Action Button */}
              <button 
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-anbit-yellow text-anbit-yellow-content font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                Dismiss <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[7px] font-black text-anbit-muted/30 uppercase tracking-[0.4em] text-center italic">
                Secure Node 041 Infrastructure
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RedemptionActiveModal;

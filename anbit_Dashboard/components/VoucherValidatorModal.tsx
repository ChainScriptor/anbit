
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  QrCode, 
  X, 
  Delete, 
  Flame, 
  Lock,
  Cpu,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface VoucherValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoucherValidatorModal: React.FC<VoucherValidatorModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (code.length < 6) {
      setCode(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCode('');
    setError(false);
  };

  const handleBurn = () => {
    if (code.length < 4) {
      setError(true);
      return;
    }
    
    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setCode('');
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError(false);
      setIsBurning(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-anbit-dark/95 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass border-2 border-anbit-yellow/30 rounded-card sm:rounded-heavy shadow-glow-yellow overflow-hidden p-6 sm:p-10 lg:p-12 my-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 sm:mb-10 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-anbit-yellow/10 rounded-xl sm:rounded-2xl border border-anbit-yellow/30">
                  <ShieldCheck className="text-anbit-yellow" size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black italic font-display tracking-tight text-white uppercase leading-tight">Επαληθευση Εξαργυρωσης</h2>
                  <p className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-anbit-yellow/60 uppercase">Συνδεσμος Υψηλης Ασφαλειας</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Code Input Display */}
            <div className="mb-6 sm:mb-10 relative">
              <div className={`w-full bg-black/40 border-2 rounded-xl sm:rounded-2xl py-4 sm:py-8 px-4 sm:px-6 flex justify-center items-center gap-2 sm:gap-3 transition-all duration-300 ${
                error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10'
              }`}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-7 sm:w-10 h-10 sm:h-14 border-b-2 sm:border-b-4 flex items-center justify-center text-xl sm:text-4xl font-black font-display italic transition-all ${
                      code[i] ? 'border-anbit-yellow text-anbit-yellow' : 'border-white/10 text-white/5'
                    }`}
                  >
                    {code[i] || '0'}
                  </div>
                ))}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-10 relative z-10">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-14 sm:h-20 glass border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black font-display italic hover:bg-anbit-yellow/10 hover:border-anbit-yellow/40 hover:text-anbit-yellow transition-all active:scale-90"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-14 sm:h-20 glass border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-[8px] sm:text-xs font-black tracking-widest text-white/30 hover:text-red-400 transition-all uppercase"
              >
                Καθαρισμος
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-14 sm:h-20 glass border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black font-display italic hover:bg-anbit-yellow/10 transition-all active:scale-90"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 sm:h-20 glass border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
              >
                <Delete size={18} sm:size={24} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 relative z-10">
              <button
                disabled={isBurning}
                onClick={handleBurn}
                className={`w-full py-4 sm:py-6 rounded-xl sm:rounded-heavy font-black italic font-display text-base sm:text-lg tracking-widest uppercase flex items-center justify-center gap-3 sm:gap-4 transition-all shadow-glow-yellow ${
                  isBurning ? 'bg-anbit-yellow/20 text-anbit-yellow cursor-wait' : 'bg-anbit-yellow text-anbit-dark hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isBurning ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> ΣΥΓΧΡΟΝΙΣΜΟΣ...
                  </>
                ) : (
                  <>
                    <Flame size={20} fill="currentColor" /> Εξουσιοδοτηση Καυσης
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button className="flex items-center justify-center gap-2 py-3 sm:py-4 glass border border-white/10 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all text-white/60">
                  <QrCode size={14} sm:size={18} /> QR
                </button>
                <button 
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 sm:py-4 glass border border-white/10 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-all text-white/60"
                >
                  Ακυρωση
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VoucherValidatorModal;
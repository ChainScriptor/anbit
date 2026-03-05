
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Info } from 'lucide-react';
import { UserData } from '../types';

interface UserQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
}

const UserQRModal: React.FC<UserQRModalProps> = ({ isOpen, onClose, user }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-anbit-bg/95 backdrop-blur-md"
          />

          {/* Modal Content Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm z-[301]"
          >
            <div className="dashboard-card bg-white p-6 sm:p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden shadow-2xl">
              {/* Internal Decoration */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-anbit-yellow" />
              
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-black fill-anbit-yellow" />
                  <span className="text-[8px] font-semibold text-gray-400 tracking-wide">Αναγνωριστικό</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black italic tracking-tighter leading-none">
                  Check-In <span className="text-gray-400">Terminal</span>
                </h3>
              </div>

              {/* QR Code Container - Compact */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-4 bg-anbit-yellow/10 rounded-[30px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white p-3 rounded-2xl border-2 border-gray-50 shadow-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${user.id}&color=000000&bgcolor=ffffff&margin=2`} 
                    alt="User QR Code"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4 w-full">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-anbit-yellow" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-black tracking-tight leading-none mb-1">{user.name}</p>
                      <p className="text-[8px] font-medium text-gray-400 tracking-wide">Επίπεδο {user.currentLevel} • {user.currentLevelName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left bg-anbit-yellow/5 p-3 rounded-xl border border-anbit-yellow/10">
                  <Info className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-gray-600 leading-snug italic">
                    Scan at merchant node to authenticate deployment and sync XP rewards.
                  </p>
                </div>
              </div>

              <p className="text-[8px] font-medium text-gray-300 tracking-wide pt-2">Node 041 Infrastructure</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserQRModal;

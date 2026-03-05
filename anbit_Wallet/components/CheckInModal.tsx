
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, Target, ChevronRight, Coffee, Utensils, GlassWater, Wrench, Sparkles, Dumbbell, UserCheck } from 'lucide-react';
import { Partner } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, partner }) => {
  // CRITICAL: Hooks must be at the top level, before any early returns
  const [people, setPeople] = useState(2);
  const [selectedTime, setSelectedTime] = useState('19:30');

  const config = useMemo(() => {
    if (!partner) return {
      missionLabel: 'Τύπος επίσκεψης',
      squadLabel: 'Άτομα',
      missions: [{ id: 'Generic', icon: Target, label: 'Γενική επίσκεψη' }]
    };

    switch (partner.category) {
      case 'Coffee':
        return {
          missionLabel: 'Είδος παραγγελίας',
          squadLabel: 'Παρέα',
          missions: [
            { id: 'Coffee', icon: Coffee, label: 'Καφές' },
            { id: 'Food', icon: Utensils, label: 'Σνακ' },
            { id: 'Takeaway', icon: ChevronRight, label: 'Takeaway' },
          ]
        };
      case 'Food':
        return {
          missionLabel: 'Τύπος επίσκεψης',
          squadLabel: 'Άτομα στο τραπέζι',
          missions: [
            { id: 'DineIn', icon: Utensils, label: 'Φαγητό' },
            { id: 'Drinks', icon: GlassWater, label: 'Ποτά' },
            { id: 'Quick', icon: ChevronRight, label: 'Γρήγορο γεύμα' },
          ]
        };
      case 'Services':
        return {
          missionLabel: 'Είδος υπηρεσίας',
          squadLabel: 'Συσκευές / Αντικείμενα',
          missions: [
            { id: 'Repair', icon: Wrench, label: 'Service / Επισκευή' },
            { id: 'Checkup', icon: Target, label: 'Έλεγχος' },
            { id: 'Consult', icon: UserCheck, label: 'Συμβουλή' },
          ]
        };
      case 'Lifestyle':
        return {
          missionLabel: 'Δραστηριότητα',
          squadLabel: 'Συμμετέχοντες',
          missions: [
            { id: 'Training', icon: Dumbbell, label: 'Προπόνηση' },
            { id: 'Session', icon: Sparkles, label: 'Session' },
            { id: 'Visit', icon: Target, label: 'Γενικό' },
          ]
        };
      default:
        return {
          missionLabel: 'Τύπος επίσκεψης',
          squadLabel: 'Άτομα',
          missions: [
            { id: 'Generic', icon: Target, label: 'Γενική επίσκεψη' },
          ]
        };
    }
  }, [partner?.category]);

  const [missionType, setMissionType] = useState(config.missions[0].id);

  if (!partner) return null;

  const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-anbit-bg/95 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full h-fit max-w-2xl z-[111]"
          >
            <div className="dashboard-card bg-anbit-card p-8 sm:p-12 flex flex-col space-y-10 relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar border-anbit-yellow/30 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-anbit-yellow" />
                  <span className="text-xs font-black text-anbit-yellow tracking-wide">
                    Κράτηση σημείου
                  </span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-black text-anbit-text italic tracking-tighter leading-none">
                   Λεπτομέρειες <span className="text-anbit-yellow">κράτησης</span>
                </h3>
                <p className="text-anbit-muted font-bold italic">
                  Κατάστημα: {partner.name}
                </p>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-xs font-black text-anbit-muted tracking-wide">
                    <Users className="w-5 h-5 text-anbit-yellow" /> {config.squadLabel}
                  </label>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setPeople(Math.max(1, people - 1))}
                      className="w-14 h-14 rounded-xl border-2 border-anbit-border flex items-center justify-center text-2xl font-black text-anbit-text hover:border-anbit-yellow transition-colors bg-white/5"
                    >
                      -
                    </button>
                    <span className="text-5xl font-black text-anbit-text italic min-w-[60px] text-center">{people}</span>
                    <button 
                      onClick={() => setPeople(Math.min(12, people + 1))}
                      className="w-14 h-14 rounded-xl border-2 border-anbit-border flex items-center justify-center text-2xl font-black text-anbit-text hover:border-anbit-yellow transition-colors bg-white/5"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-xs font-black text-anbit-muted tracking-wide">
                    <Target className="w-5 h-5 text-anbit-yellow" /> {config.missionLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {config.missions.map((m) => {
                      const Icon = m.icon;
                      const isActive = missionType === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMissionType(m.id)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            isActive 
                              ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content' 
                              : 'bg-white/5 border-anbit-border text-anbit-muted hover:border-white/20'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="font-black text-[8px] tracking-wide text-center">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-xs font-black text-anbit-muted tracking-wide">
                    <Clock className="w-5 h-5 text-anbit-yellow" /> Ώρα άφιξης
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-lg font-black text-[10px] border-2 transition-all ${
                          selectedTime === t 
                            ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content' 
                            : 'bg-transparent border-anbit-border text-anbit-muted hover:border-anbit-yellow/50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={onClose}
                  className="w-full py-6 rounded-[24px] bg-anbit-yellow text-anbit-yellow-content font-black text-xl tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-4 group/btn shadow-2xl"
                >
                  Επιβεβαίωση κράτησης <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckInModal;

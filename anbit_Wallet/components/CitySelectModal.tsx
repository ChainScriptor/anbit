import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Crosshair, List, Plus, Search, X } from 'lucide-react';
import type { WalletCity, WalletCityId } from '../data/walletCities';
import { WALLET_CITIES } from '../data/walletCities';
import { cn } from '@/lib/utils';

type LocationModalStep = 'intro' | 'cities';

interface CitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityId: WalletCityId;
  onConfirm: (id: WalletCityId) => void;
  pickNearestFromCoords: (lat: number, lon: number) => WalletCityId;
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  isOpen,
  onClose,
  currentCityId,
  onConfirm,
  pickNearestFromCoords,
}) => {
  const [step, setStep] = useState<LocationModalStep>('intro');
  const [draftId, setDraftId] = useState<WalletCityId>(currentCityId);
  const [search, setSearch] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setDraftId(currentCityId);
      setSearch('');
    }
  }, [isOpen, currentCityId]);

  const draftCity: WalletCity = useMemo(
    () => WALLET_CITIES.find((c) => c.id === draftId) ?? WALLET_CITIES[0],
    [draftId],
  );

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WALLET_CITIES;
    return WALLET_CITIES.filter((c) => c.labelEl.toLowerCase().includes(q) || c.mapLabel.toLowerCase().includes(q));
  }, [search]);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const id = pickNearestFromCoords(pos.coords.latitude, pos.coords.longitude);
        setDraftId(id);
        onConfirm(id);
        setGeoLoading(false);
        onClose();
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 },
    );
  }, [pickNearestFromCoords, onConfirm, onClose]);

  const confirm = () => {
    onConfirm(draftId);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step === 'cities') setStep('intro');
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 font-sans backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={step === 'intro' ? 'location-intro-title' : 'location-cities-title'}
            className={cn(
              'relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-zinc-800/80 bg-[#1a1a1a] shadow-2xl sm:max-h-[min(88dvh,720px)] sm:rounded-2xl',
              step === 'intro' ? 'max-h-[calc(100dvh-0.5rem)]' : 'flex max-h-[min(88dvh,720px)] flex-col',
            )}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'intro' ? (
              <div className="flex flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                <div className="flex items-start justify-between gap-3">
                  <h1
                    id="location-intro-title"
                    className="playpen-sans text-[2rem] font-extrabold leading-none tracking-tight text-white sm:text-[2.25rem]"
                  >
                    Πού;
                  </h1>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
                    aria-label="Κλείσιμο"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
                <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-zinc-400 sm:max-w-none">
                  Για να δεις όλα τα εστιατόρια και τα καταστήματα που κάνουν παράδοση σε σένα, πρόσθεσε τη διεύθυνσή
                  σου παρακάτω.
                </p>

                <div className="flex min-h-[10rem] flex-1 items-center justify-center py-6 sm:min-h-[12rem] sm:py-8">
                  <img
                    src="/earth.svg"
                    alt=""
                    className="h-40 w-40 max-w-[85%] object-contain sm:h-52 sm:w-52"
                    decoding="async"
                  />
                </div>

                <div className="mt-2 border-t border-zinc-800/90">
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={geoLoading}
                    className="flex w-full items-center gap-4 border-b border-zinc-800/90 py-4 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5 shrink-0 text-white" strokeWidth={2.2} />
                    <span className="text-base font-bold text-white">
                      {geoLoading ? 'Λήψη τοποθεσίας…' : 'Προσθήκη νέας διεύθυνσης'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('cities')}
                    className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <List className="h-5 w-5 shrink-0 text-white" strokeWidth={2.2} />
                    <span className="text-base font-bold text-white">Περιηγηθείτε σε όλες τις πόλεις</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/80 px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setStep('intro')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-white"
                    aria-label="Πίσω"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2 id="location-cities-title" className="truncate text-base font-bold text-white sm:text-lg">
                      Όλες οι πόλεις
                    </h2>
                    <p className="truncate text-xs text-zinc-400">Επίλεξε πόλη · {draftCity.labelEl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700/80 text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-white"
                    aria-label="Κλείσιμο"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
                  <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Search className="h-4 w-4 text-zinc-500" />
                    </div>
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-3 text-sm font-medium text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-600"
                      placeholder="Αναζήτηση πόλης"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={geoLoading}
                    className="mb-4 flex w-full items-center justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3 text-left transition-colors hover:bg-zinc-900/70 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Crosshair className="h-5 w-5 text-zinc-300" />
                      <span className="text-sm font-medium text-zinc-200">
                        {geoLoading ? 'Λήψη τοποθεσίας…' : 'Τρέχουσα τοποθεσία'}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                  </button>

                  <div className="space-y-1 pb-4">
                    {filteredCities.length === 0 ? (
                      <p className="py-6 text-center text-sm text-zinc-500">Δεν βρέθηκε πόλη.</p>
                    ) : (
                      filteredCities.map((city) => {
                        const active = city.id === draftId;
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => setDraftId(city.id)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors',
                              active ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/40',
                            )}
                          >
                            <span className={cn('truncate font-semibold', active ? 'text-white' : 'text-zinc-300')}>
                              {city.labelEl}
                            </span>
                            {active ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                            ) : (
                              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-zinc-800/80 px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    onClick={confirm}
                    className="w-full rounded-xl bg-white py-3.5 text-base font-bold text-black transition hover:bg-zinc-200"
                  >
                    Επιβεβαίωση · {draftCity.labelEl}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

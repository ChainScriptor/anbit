import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Crosshair,
  ChevronRight,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Layers,
} from 'lucide-react';
import type { WalletCity, WalletCityId } from '../data/walletCities';
import { WALLET_CITIES } from '../data/walletCities';
import AnbitWordmark from './AnbitWordmark';

const MERCHANT_AVATARS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=128&h=128&fit=crop',
];

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
  const [draftId, setDraftId] = useState<WalletCityId>(currentCityId);
  const [search, setSearch] = useState('');
  const [mapScale, setMapScale] = useState(1);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftId(currentCityId);
      setSearch('');
      setMapScale(1);
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
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 },
    );
  }, [pickNearestFromCoords]);

  const confirm = () => {
    onConfirm(draftId);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const extraMerchants = Math.max(0, draftCity.merchantsCount - 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="city-select-title"
            className="relative w-full max-w-6xl h-[min(870px,calc(100dvh-1.5rem))] min-h-[min(520px,90dvh)] bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row border border-zinc-800/50"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <aside className="w-full md:w-[420px] md:max-w-[42%] h-[52%] md:h-full bg-black flex flex-col relative z-20 border-b md:border-b-0 md:border-r border-zinc-900 shrink-0">
              <div className="p-6 md:p-8 flex-1 overflow-y-auto min-h-0">
                <div className="flex items-center gap-3 mb-8 md:mb-12">
                  <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </div>
                  <AnbitWordmark className="text-white text-xl md:text-2xl" />
                </div>

                <div className="mb-8 md:mb-10">
                  <h1 id="city-select-title" className="text-white font-bold text-2xl md:text-3xl leading-tight mb-2 md:mb-3">
                    Επιλέξτε πόλη
                  </h1>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Experience premium hospitality tech in your region.
                  </p>
                </div>

                <div className="space-y-4 mb-8 md:mb-10">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-zinc-600 group-focus-within:text-[#0a0a0a] transition-colors" />
                    </div>
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-zinc-900 border-none rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-[#0a0a0a]/50 transition-all font-medium outline-none"
                      placeholder="Αναζήτηση πόλης"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={geoLoading}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-900 rounded-2xl transition-all group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-9 h-9">
                        <div className="absolute inset-0 rounded-full bg-[#0a0a0a]/20 city-select-pulse-red" aria-hidden />
                        <Crosshair className="w-5 h-5 text-[#0a0a0a] relative z-[1]" strokeWidth={2} />
                      </div>
                      <span className="text-zinc-300 font-medium text-sm">
                        {geoLoading ? 'Λήψη τοποθεσίας…' : 'Use Current Location'}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-zinc-600 font-medium text-[10px] uppercase tracking-[0.2em] mb-3 md:mb-4">
                    Popular Cities
                  </h3>
                  {filteredCities.length === 0 ? (
                    <p className="text-zinc-500 text-sm py-4">Δεν βρέθηκε πόλη.</p>
                  ) : (
                    filteredCities.map((city) => {
                      const active = city.id === draftId;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => setDraftId(city.id)}
                          className={`group w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                            active
                              ? 'bg-[#0a0a0a]/5 border border-[#0a0a0a]/20'
                              : 'hover:bg-zinc-900/50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                active
                                  ? 'bg-[#0a0a0a] shadow-[0_0_8px_#0a0a0a]'
                                  : 'bg-zinc-800 group-hover:bg-zinc-500'
                              }`}
                            />
                            <span
                              className={`font-semibold truncate ${
                                active ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                              }`}
                            >
                              {city.labelEl}
                            </span>
                          </div>
                          {active ? (
                            <CheckCircle2 className="w-5 h-5 text-[#0a0a0a] shrink-0" strokeWidth={2} />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-6 md:p-8 pt-2 md:pt-4 bg-gradient-to-t from-black via-black to-transparent shrink-0">
                <button
                  type="button"
                  onClick={confirm}
                  className="w-full bg-[#0a0a0a] hover:bg-black text-white font-bold py-4 md:py-5 rounded-2xl transition-all transform active:scale-[0.98] shadow-[0_20px_40px_rgba(10,10,10,0.2)]"
                >
                  Επιβεβαίωση Πόλης
                </button>
              </div>
            </aside>

            {/* Map panel */}
            <main className="flex-1 relative bg-zinc-950 overflow-hidden min-h-[48%] md:min-h-0">
              <div
                className="absolute inset-0 opacity-40 grayscale contrast-125 saturate-0 origin-center transition-transform duration-300"
                style={{ transform: `scale(${mapScale})` }}
              >
                <img
                  src={draftCity.mapImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 dark-city-map-vignette pointer-events-none opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />

              <motion.div
                className="absolute top-8 md:top-12 left-4 md:left-12 z-10"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
              >
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 max-w-[calc(100vw-2rem)]">
                  <div className="flex -space-x-3 shrink-0">
                    <img
                      src={MERCHANT_AVATARS[0]}
                      alt=""
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-zinc-900 object-cover"
                    />
                    <img
                      src={MERCHANT_AVATARS[1]}
                      alt=""
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-zinc-900 object-cover"
                    />
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-zinc-900 bg-[#0a0a0a] flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white">
                      +{extraMerchants}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-xs md:text-sm">
                      {draftCity.merchantsCount}+ Merchants
                    </p>
                    <p className="text-zinc-500 text-[11px] md:text-xs truncate">
                      active in {draftCity.mapLabel.charAt(0) + draftCity.mapLabel.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#0a0a0a] rounded-full border-4 border-white/20 shadow-[0_0_20px_#0a0a0a] city-select-pulse-red flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0a0a0a] px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                    Selected
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 right-[18%] md:right-1/4 z-10 hidden sm:block">
                <button
                  type="button"
                  className="w-4 h-4 bg-zinc-700/50 rounded-full border-2 border-zinc-600 flex items-center justify-center hover:bg-[#0a0a0a]/50 transition-colors"
                  aria-label="Άλλο σημείο"
                >
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                </button>
              </div>

              <div className="absolute bottom-6 md:bottom-10 right-4 md:right-10 flex flex-col gap-3 z-10">
                <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl flex flex-col p-1">
                  <button
                    type="button"
                    onClick={() => setMapScale((s) => Math.min(s + 0.12, 1.45))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                    aria-label="Zoom in"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <div className="h-px bg-zinc-800 mx-2" />
                  <button
                    type="button"
                    onClick={() => setMapScale((s) => Math.max(s - 0.12, 0.85))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                    aria-label="Zoom out"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="w-12 h-12 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-[#0a0a0a] transition-all shadow-xl"
                  aria-label="Layers"
                >
                  <Layers className="w-5 h-5" />
                </button>
              </div>

              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-600 text-[10px] md:text-xs tracking-[0.35em] font-semibold pointer-events-none z-[1]">
                {draftCity.mapLabel}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 md:top-8 right-4 md:right-8 w-11 h-11 md:w-12 md:h-12 bg-black/40 backdrop-blur-xl hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all z-20"
                aria-label="Κλείσιμο"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </main>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

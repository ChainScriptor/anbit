import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getWalletCityById,
  nearestWalletCity,
  type WalletCity,
  type WalletCityId,
  WALLET_CITIES,
} from '../data/walletCities';

const STORAGE_KEY = 'anbit_wallet_selected_city';

function readStoredCityId(): WalletCityId {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s && WALLET_CITIES.some((c) => c.id === s)) return s as WalletCityId;
  } catch {
    /* ignore */
  }
  return 'thessaloniki';
}

interface CityContextValue {
  city: WalletCity;
  cityId: WalletCityId;
  setCityId: (id: WalletCityId) => void;
  cities: typeof WALLET_CITIES;
  /** Γεωεντοπισμός → πλησιέστερη πόλη από τη λίστα */
  pickNearestCityFromCoords: (lat: number, lon: number) => WalletCityId;
}

const CityContext = createContext<CityContextValue | null>(null);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cityId, setCityIdState] = useState<WalletCityId>(() => readStoredCityId());

  const setCityId = useCallback((id: WalletCityId) => {
    setCityIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const pickNearestCityFromCoords = useCallback((lat: number, lon: number) => {
    return nearestWalletCity(lat, lon).id;
  }, []);

  const value = useMemo<CityContextValue>(() => {
    const city = getWalletCityById(cityId);
    return {
      city,
      cityId,
      setCityId,
      cities: WALLET_CITIES,
      pickNearestCityFromCoords,
    };
  }, [cityId, setCityId, pickNearestCityFromCoords]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
}

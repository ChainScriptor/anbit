import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'anbit_wallet_favorite_merchant_ids';
const CHANGE_EVENT = 'anbit-favorites-changed';

export function loadFavoriteMerchantIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function saveFavoriteMerchantIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Επιστρέφει το νέο σύνολο μετά το toggle και ειδοποιεί άλλα components (ίδιο tab + άλλα tabs). */
export function toggleFavoriteMerchantId(id: string): Set<string> {
  const next = new Set(loadFavoriteMerchantIds());
  if (!id) return next;
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveFavoriteMerchantIds(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
  return next;
}

export function subscribeFavoriteMerchantsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

/** Για κάρτες με σταθερό merchant id (π.χ. Network). */
export function useFavoriteMerchant(merchantId: string): [boolean, () => void] {
  const [fav, setFav] = useState(() => loadFavoriteMerchantIds().has(merchantId));
  useEffect(() => {
    setFav(loadFavoriteMerchantIds().has(merchantId));
    return subscribeFavoriteMerchantsChanged(() => {
      setFav(loadFavoriteMerchantIds().has(merchantId));
    });
  }, [merchantId]);
  const toggle = useCallback(() => {
    const next = toggleFavoriteMerchantId(merchantId);
    setFav(next.has(merchantId));
  }, [merchantId]);
  return [fav, toggle];
}

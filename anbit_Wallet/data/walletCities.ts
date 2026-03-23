/** Πόλεις για επιλογή στο Wallet (header). */
export type WalletCityId = 'athens' | 'thessaloniki' | 'patra' | 'heraklion';

export interface WalletCity {
  id: WalletCityId;
  labelEl: string;
  mapLabel: string;
  merchantsCount: number;
  mapImage: string;
  /** Κέντρο για «τρέχουσα τοποθεσία» (προσεγγιστικά) */
  lat: number;
  lon: number;
}

export const WALLET_CITIES: WalletCity[] = [
  {
    id: 'athens',
    labelEl: 'Αθήνα',
    mapLabel: 'ATHENS',
    merchantsCount: 120,
    mapImage:
      'https://images.unsplash.com/photo-1563789031959-11229ae88849?auto=format&fit=crop&q=80&w=1400',
    lat: 37.9838,
    lon: 23.7275,
  },
  {
    id: 'thessaloniki',
    labelEl: 'Θεσσαλονίκη',
    mapLabel: 'THESSALONIKI',
    merchantsCount: 86,
    mapImage:
      'https://images.unsplash.com/photo-1596484552834-6a58f004e0e9?auto=format&fit=crop&q=80&w=1400',
    lat: 40.6401,
    lon: 22.9444,
  },
  {
    id: 'patra',
    labelEl: 'Πάτρα',
    mapLabel: 'PATRAS',
    merchantsCount: 42,
    mapImage:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1400',
    lat: 38.2466,
    lon: 21.7346,
  },
  {
    id: 'heraklion',
    labelEl: 'Ηράκλειο',
    mapLabel: 'HERAKLION',
    merchantsCount: 38,
    mapImage:
      'https://images.unsplash.com/photo-1613395877344-13d4c79e4df1?auto=format&fit=crop&q=80&w=1400',
    lat: 35.3387,
    lon: 25.1442,
  },
];

export function getWalletCityById(id: WalletCityId): WalletCity {
  return WALLET_CITIES.find((c) => c.id === id) ?? WALLET_CITIES[1];
}

/** Απόσταση σε km (προσέγγιση σφαίρας) */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function nearestWalletCity(lat: number, lon: number): WalletCity {
  let best = WALLET_CITIES[0];
  let bestD = Infinity;
  for (const c of WALLET_CITIES) {
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

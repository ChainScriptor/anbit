import axios, { type AxiosInstance, isAxiosError } from 'axios';
import type { Product } from '../types';

// Χρησιμοποιούμε Vite proxy: /api → http://localhost:5057
const API_BASE_URL = '/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('anbit_dashboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anbit_dashboard_token');
      localStorage.removeItem('anbit_dashboard_user');
      window.location.href = '/#/auth';
    }
    return Promise.reject(error);
  },
);

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  xp: number;
  merchantId: string;
  category: string;
  imageUrl?: string | null;
}

export interface ApiOrder {
  id: string;
  userId?: string;
  merchantId?: string;
  tableNumber?: number;
  items?: { productId: string; quantity: number; unitPrice?: number; unitXp?: number }[];
  totalPrice: number;
  totalXp?: number;
  createdAt: string;
  updatedAt?: string;
  status?: string;
}

export interface ApiMerchantUser {
  id: string;
  username: string;
  email: string;
}

export interface QrCodeCreateResponse {
  shortCode: string;
}

export interface MerchantTableQr {
  id: string;
  tableId: number;
  shortCode: string;
  createdAt: string;
}

export interface MerchantCategoriesPayload {
  categories: string[];
}

/** Το backend απορρίπτει Guid.Empty· φιλτράρουμε και μη-GUID strings. */
const MERCHANT_GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMPTY_MERCHANT_GUID_RE =
  /^0{8}-0{4}-0{4}-0{4}-0{12}$/i;

export function isUsableMerchantId(id: string | null | undefined): boolean {
  if (!id) return false;
  const t = id.trim();
  if (!MERCHANT_GUID_RE.test(t)) return false;
  if (EMPTY_MERCHANT_GUID_RE.test(t)) return false;
  return true;
}

function normalizeMerchantUserFromApi(raw: unknown): ApiMerchantUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '').trim();
  if (!isUsableMerchantId(id)) return null;
  const username =
    String(r.username ?? r.Username ?? '').trim() || `merchant-${id.slice(0, 8)}`;
  const email = String(r.email ?? r.Email ?? '').trim() || '—';
  return { id, username, email };
}

async function collectMerchantIdsFromPagedProducts(): Promise<Set<string>> {
  const idSet = new Set<string>();
  const pageSize = 100;
  const maxPages = 50;
  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    try {
      const { data } = await apiClient.get<ApiProduct[]>('/Products', {
        params: { limit: pageSize, offset },
      });
      const batch = Array.isArray(data) ? data : [];
      for (const p of batch) {
        const mid = p.merchantId ? String(p.merchantId) : '';
        if (isUsableMerchantId(mid)) idSet.add(mid);
      }
      if (batch.length < pageSize) break;
    } catch {
      break;
    }
  }
  return idSet;
}

async function collectMerchantIdsFromPagedOrders(): Promise<Set<string>> {
  const idSet = new Set<string>();
  const pageSize = 100;
  const maxPages = 50;
  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    try {
      const { data } = await apiClient.get<ApiOrder[]>('/Orders', {
        params: { limit: pageSize, offset },
      });
      const batch = Array.isArray(data) ? data : [];
      for (const o of batch) {
        const mid = o.merchantId ? String(o.merchantId) : '';
        if (isUsableMerchantId(mid)) idSet.add(mid);
      }
      if (batch.length < pageSize) break;
    } catch {
      break;
    }
  }
  return idSet;
}

export const api = {
  async getProducts(): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<ApiProduct[]>('/Products', {
      params: { limit: 50, offset: 0 },
    });
    return data;
  },

  /**
   * Προϊόντα συγκεκριμένου merchant.
   * Το backend επιτρέπει limit το πολύ 100 (GetProductsByMerchantIdQueryValidator).
   */
  async getProductsByMerchantId(
    merchantId: string,
    maxItems = 500,
  ): Promise<ApiProduct[]> {
    if (!isUsableMerchantId(merchantId)) {
      return [];
    }
    const pageSize = 100;
    const all: ApiProduct[] = [];
    for (let offset = 0; offset < maxItems; offset += pageSize) {
      const { data } = await apiClient.get<ApiProduct[]>(
        `/Products/merchants/${encodeURIComponent(merchantId)}`,
        { params: { limit: pageSize, offset } },
      );
      const batch = Array.isArray(data) ? data : [];
      all.push(...batch);
      if (batch.length < pageSize) break;
    }
    return all;
  },

  async createProduct(
    formData: FormData,
    merchantId?: string
  ): Promise<void> {
    await apiClient.post('/Products', formData, {
      params: merchantId ? { merchantId } : undefined,
    });
  },

  /** Καλεί πάντα `GET /Auth/merchants`. Για admin λίστα χωρίς 404 χρησιμοποίησε `getMerchantsDirectory`. */
  async getMerchants(): Promise<ApiMerchantUser[]> {
    const { data } = await apiClient.get<ApiMerchantUser[]>('/Auth/merchants');
    return data;
  },

  /**
   * Λίστα merchants για admin:
   * - Αν `VITE_FETCH_AUTH_MERCHANTS=true` και υπάρχει `GET /Auth/merchants` → username/email/uuid από τη ΒΔ.
   * - Συμπληρωματικά: uuid από σελιδοποιημένα Products + Orders (έως 50×100 εγγραφές το καθένα).
   * Χωρίς Auth endpoint δεν είναι δυνατό να φανούν όλοι οι merchants χωρίς προϊόν/παραγγελία.
   */
  async getMerchantsDirectory(): Promise<{
    merchants: ApiMerchantUser[];
    source: 'auth' | 'derived' | 'mixed';
  }> {
    let fromAuth: ApiMerchantUser[] = [];
    const useAuthList = import.meta.env.VITE_FETCH_AUTH_MERCHANTS === 'true';

    if (useAuthList) {
      try {
        const { data } = await apiClient.get<unknown[]>('/Auth/merchants');
        if (Array.isArray(data)) {
          fromAuth = data
            .map((row) => normalizeMerchantUserFromApi(row))
            .filter((x): x is ApiMerchantUser => x !== null);
        }
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) {
          throw e;
        }
      }
    }

    const authById = new Map(
      fromAuth.map((m) => [m.id.toLowerCase(), m] as const),
    );

    const [fromProducts, fromOrders] = await Promise.all([
      collectMerchantIdsFromPagedProducts(),
      collectMerchantIdsFromPagedOrders(),
    ]);

    const idSet = new Set<string>([...fromProducts, ...fromOrders]);

    const derivedOnly: ApiMerchantUser[] = [];
    for (const id of idSet) {
      const key = id.toLowerCase();
      if (!authById.has(key)) {
        derivedOnly.push({
          id,
          username: '—',
          email:
            '— (στη ΒΔ υπάρχει ο λογαριασμός· για username/email όρισε VITE_FETCH_AUTH_MERCHANTS=true αν το API έχει GET /Auth/merchants)',
        });
      }
    }

    fromAuth.sort((a, b) =>
      a.username.localeCompare(b.username, 'el', { sensitivity: 'base' }),
    );
    derivedOnly.sort((a, b) => a.id.localeCompare(b.id));
    const merged = [...fromAuth, ...derivedOnly];

    const source: 'auth' | 'derived' | 'mixed' =
      fromAuth.length > 0 && derivedOnly.length > 0
        ? 'mixed'
        : fromAuth.length > 0
          ? 'auth'
          : 'derived';

    return { merchants: merged, source };
  },

  async generateQrCode(payload: { merchantId: string; tableId: number }): Promise<string> {
    const { data } = await apiClient.post<QrCodeCreateResponse>('/QrCodes', payload);
    return data.shortCode;
  },

  async getMerchantTables(merchantId: string): Promise<MerchantTableQr[]> {
    const { data } = await apiClient.get<MerchantTableQr[]>('/QrCodes', {
      params: { merchantId },
    });
    return data;
  },

  async getOrders(): Promise<ApiOrder[]> {
    const { data } = await apiClient.get<ApiOrder[]>('/Orders', {
      params: { limit: 50, offset: 0 },
    });
    return data;
  },

  async acceptOrder(orderId: string): Promise<void> {
    await apiClient.put(`/Orders/${orderId}/accept`);
  },

  async rejectOrder(orderId: string): Promise<void> {
    await apiClient.put(`/Orders/${orderId}/reject`);
  },

  async completeOrder(orderId: string): Promise<void> {
    await apiClient.put(`/Orders/${orderId}/complete`);
  },

  async registerMerchant(payload: {
    username: string;
    email: string;
    password: string;
    secret: string;
  }): Promise<void> {
    await apiClient.post('/Auth/register-merchant', payload);
  },

  /**
   * Μόνο για χρήστη με ρόλο **Merchant** (το backend δεν δέχεται admin → 403).
   * Σε admin flows (π.χ. Stores Management) μην καλείς· χρησιμοποίησε κατηγορίες από προϊόντα.
   */
  async getMerchantCategories(merchantId?: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/merchants/categories', {
      params: merchantId ? { merchantId } : undefined,
    });
    return data;
  },

  async upsertMerchantCategories(
    payload: MerchantCategoriesPayload,
    merchantId?: string,
  ): Promise<void> {
    await apiClient.put('/merchants/categories', payload, {
      params: merchantId ? { merchantId } : undefined,
    });
  },
};


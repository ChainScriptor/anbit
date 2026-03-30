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

export interface QrCodeDetailsResponse {
  merchantId: string;
  tableId: number;
}

export interface MerchantCategoriesPayload {
  categories: string[];
}

const MERCHANT_QR_CACHE_KEY = 'anbit_dashboard_qr_tables_v1';

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

function unwrapQrTablePayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    const inner =
      o.data ??
      o.Data ??
      o.items ??
      o.Items ??
      o.results ??
      o.Results ??
      o.qrCodes ??
      o.QrCodes;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function normalizeMerchantTableQr(raw: unknown): MerchantTableQr | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const tableId = Number(
    r.tableId ?? r.TableId ?? r.tableNumber ?? r.TableNumber,
  );
  const shortCode = String(r.shortCode ?? r.ShortCode ?? '').trim();
  if (!shortCode || !Number.isFinite(tableId) || tableId <= 0) return null;
  const idRaw = String(r.id ?? r.Id ?? '').trim();
  const id =
    idRaw && idRaw !== 'undefined' ? idRaw : `${tableId}-${shortCode}`;
  const ca = r.createdAt ?? r.CreatedAt;
  let createdAt = new Date().toISOString();
  if (typeof ca === 'string' && ca) createdAt = ca;
  else if (typeof ca === 'number' && Number.isFinite(ca))
    createdAt = new Date(ca).toISOString();
  return { id, tableId, shortCode, createdAt };
}

function mapQrTableResponse(data: unknown): MerchantTableQr[] {
  return unwrapQrTablePayload(data)
    .map((row) => normalizeMerchantTableQr(row))
    .filter((x): x is MerchantTableQr => x !== null);
}

type QrCache = Record<string, MerchantTableQr[]>;

function readQrCache(): QrCache {
  try {
    const raw = localStorage.getItem(MERCHANT_QR_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: QrCache = {};
    for (const [merchantId, listRaw] of Object.entries(parsed as Record<string, unknown>)) {
      const mapped = mapQrTableResponse(listRaw);
      if (mapped.length > 0) out[merchantId] = mapped;
    }
    return out;
  } catch {
    return {};
  }
}

function writeQrCache(cache: QrCache): void {
  try {
    localStorage.setItem(MERCHANT_QR_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage quota / private mode errors
  }
}

function readMerchantTablesFromCache(merchantId: string): MerchantTableQr[] {
  const cache = readQrCache();
  const list = cache[merchantId] ?? [];
  return [...list].sort((a, b) => {
    const at = new Date(a.createdAt ?? 0).getTime();
    const bt = new Date(b.createdAt ?? 0).getTime();
    return bt - at;
  });
}

function writeMerchantTablesToCache(merchantId: string, list: MerchantTableQr[]): void {
  const cache = readQrCache();
  cache[merchantId] = [...list];
  writeQrCache(cache);
}

function upsertMerchantTableToCache(
  merchantId: string,
  tableId: number,
  shortCode: string,
): void {
  const cache = readQrCache();
  const current = cache[merchantId] ?? [];
  const nextItem: MerchantTableQr = {
    id: `${merchantId}-${tableId}-${shortCode}`,
    tableId,
    shortCode,
    createdAt: new Date().toISOString(),
  };
  const deduped = current.filter(
    (x) =>
      x.shortCode.toLowerCase() !== shortCode.toLowerCase() &&
      !(x.tableId === tableId && x.shortCode.toLowerCase() === shortCode.toLowerCase()),
  );
  cache[merchantId] = [nextItem, ...deduped];
  writeQrCache(cache);
}

/**
 * Admin: `GET /Merchants` (limit ≤ 100). Επιστρέφει `MerchantResponse` (id, username, email).
 * `null` = αποτυχία κλήσης (π.χ. 403)· κενός πίνακας = επιτυχία χωρίς εγγραφές.
 */
async function fetchAllMerchantsFromMerchantsApi(): Promise<ApiMerchantUser[] | null> {
  const pageSize = 100;
  const all: ApiMerchantUser[] = [];
  try {
    for (let offset = 0; ; offset += pageSize) {
      const { data } = await apiClient.get<unknown[]>('/Merchants', {
        params: { limit: pageSize, offset },
      });
      const batch = Array.isArray(data) ? data : [];
      for (const row of batch) {
        const m = normalizeMerchantUserFromApi(row);
        if (m) {
          all.push(m);
        }
      }
      if (batch.length < pageSize) {
        break;
      }
    }
    return all;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 401) {
      throw e;
    }
    return null;
  }
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

  async uploadProductImage(productId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    await apiClient.put(`/Products/${encodeURIComponent(productId)}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteProductImage(productId: string): Promise<void> {
    await apiClient.delete(`/Products/${encodeURIComponent(productId)}/images`);
  },

  /** Καλεί `GET /Merchants` (σελιδοποίηση). Απαιτεί admin Bearer token. */
  async getMerchants(): Promise<ApiMerchantUser[]> {
    const list = await fetchAllMerchantsFromMerchantsApi();
    if (list === null) {
      throw new Error('Merchants list unavailable (GET /Merchants)');
    }
    return list;
  },

  /**
   * Λίστα merchants για admin:
   * - `GET /Merchants?limit&offset` → username / email / uuid από τη ΒΔ (`MerchantResponse`).
   * - Συμπληρωματικά: uuid από Products + Orders αν λείπουν από τη λίστα χρηστών.
   */
  async getMerchantsDirectory(): Promise<{
    merchants: ApiMerchantUser[];
    source: 'auth' | 'derived' | 'mixed';
  }> {
    let fromAuth: ApiMerchantUser[] = [];
    try {
      const fromApi = await fetchAllMerchantsFromMerchantsApi();
      if (fromApi !== null) {
        fromAuth = fromApi;
      }
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        throw e;
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
            '— (uuid από προϊόν/παραγγελία· λείπει από GET /Merchants — έλεγξε ρόλο Merchant στη ΒΔ)',
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
    const { data } = await apiClient.post<QrCodeCreateResponse | { ShortCode?: string }>('/QrCodes', payload);
    const shortCode = String((data as { shortCode?: string }).shortCode ?? (data as { ShortCode?: string }).ShortCode ?? '').trim();
    if (!shortCode) {
      throw new Error('QR generation succeeded but shortCode is missing.');
    }
    if (isUsableMerchantId(payload.merchantId) && Number.isFinite(payload.tableId) && payload.tableId > 0) {
      upsertMerchantTableToCache(payload.merchantId, payload.tableId, shortCode);
    }
    return shortCode;
  },

  async getMerchantTables(merchantId: string): Promise<MerchantTableQr[]> {
    if (!isUsableMerchantId(merchantId)) {
      return [];
    }
    try {
      const pageSize = 100;
      const all: MerchantTableQr[] = [];
      for (let offset = 0; ; offset += pageSize) {
        const { data } = await apiClient.get<unknown>('/QrCodes', {
          params: { merchantId, limit: pageSize, offset },
        });
        const batch = mapQrTableResponse(data);
        all.push(...batch);
        if (batch.length < pageSize) break;
      }
      writeMerchantTablesToCache(merchantId, all);
      return all;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        throw e;
      }
      // Fallback για παλιότερο backend χωρίς list-by-merchant endpoint.
      return readMerchantTablesFromCache(merchantId);
    }
  },

  async getQrCodeDetails(shortCode: string): Promise<QrCodeDetailsResponse> {
    const clean = shortCode.trim();
    const { data } = await apiClient.get<{
      merchantId?: string;
      MerchantId?: string;
      tableId?: number;
      TableId?: number;
    }>(`/QrCodes/${encodeURIComponent(clean)}`);
    const merchantId = String(data.merchantId ?? data.MerchantId ?? '').trim();
    const tableId = Number(data.tableId ?? data.TableId ?? 0);
    if (isUsableMerchantId(merchantId) && Number.isFinite(tableId) && tableId > 0) {
      upsertMerchantTableToCache(merchantId, tableId, clean);
    }
    return { merchantId, tableId };
  },

  async getOrders(): Promise<ApiOrder[]> {
    const { data } = await apiClient.get<ApiOrder[]>('/Orders', {
      // Backend query is paged; limit=100 ensures newer orders are in the first page.
      params: { limit: 100, offset: 0 },
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


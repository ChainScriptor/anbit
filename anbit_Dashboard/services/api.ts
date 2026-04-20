import axios, { type AxiosInstance, isAxiosError } from 'axios';

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
      const requestUrl = String(error.config?.url ?? '');
      const requestMethod = String(error.config?.method ?? 'get').toLowerCase();
      // Only suppress redirect for GET /Products (some roles can't read the list).
      // Mutating requests (PUT/POST/DELETE) on an expired token must redirect to login.
      const isProductsListGet = requestUrl.includes('/Products') && requestMethod === 'get';
      const isAuthLoginRequest = requestUrl.includes('/Auth/login');

      if (!isProductsListGet && !isAuthLoginRequest) {
        localStorage.removeItem('anbit_dashboard_token');
        localStorage.removeItem('anbit_dashboard_user');
        window.location.href = '/#/auth';
      }
    }
    return Promise.reject(error);
  },
);

export type ApiProductOptionSelectionType = 'Single' | 'Multiple';

export interface ApiProductOptionRow {
  id: string;
  name: string;
  price: number;
}

export interface ApiProductOptionGroupRow {
  id: string;
  name: string;
  type: ApiProductOptionSelectionType;
  options: ApiProductOptionRow[];
}

export interface ProductOptionGroupApiPayload {
  name: string;
  type: ApiProductOptionSelectionType;
  options: { name: string; price: number }[];
}

export interface CreateProductPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  xp: number;
  allergens?: string[] | null;
  /** Πίνακας όπως στο JSON body ή serialized string αν το backend δέχεται κυριολεκτικό JSON string. */
  optionGroupsJson?: ProductOptionGroupApiPayload[] | string | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  xp: number;
  merchantId: string;
  category: string;
  imageUrl?: string | null;
  optionGroups?: ApiProductOptionGroupRow[];
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

export interface CustomerAnalyticsItem {
  userId: string;
  username: string;
  totalSpent: number;
  totalOrders: number;
  totalXpEarned: number;
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
      const { data } = await apiClient.get<unknown[]>('/Products', {
        params: { limit: pageSize, offset },
      });
      const batch = Array.isArray(data) ? data.map(normalizeApiProduct) : [];
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

function readApiNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function newLocalApiId(prefix: string): string {
  try {
    const c = globalThis.crypto?.randomUUID?.();
    if (c) return `${prefix}-${c}`;
  } catch {
    /* ignore */
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeApiProductOptionRow(raw: unknown): ApiProductOptionRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '').trim() || newLocalApiId('opt');
  const name = String(r.name ?? r.Name ?? '').trim();
  if (!name) return null;
  const price = readApiNumber(r.price ?? r.Price, 0);
  return { id, name, price };
}

function normalizeApiProductOptionGroupRow(raw: unknown): ApiProductOptionGroupRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '').trim() || newLocalApiId('grp');
  const name = String(r.name ?? r.Name ?? '').trim();
  if (!name) return null;
  const typeRaw = String(r.type ?? r.Type ?? 'Single');
  const type: ApiProductOptionSelectionType = typeRaw === 'Multiple' ? 'Multiple' : 'Single';
  const optsRaw = r.options ?? r.Options;
  const optsArr = Array.isArray(optsRaw) ? optsRaw : [];
  const options = optsArr
    .map((o) => normalizeApiProductOptionRow(o))
    .filter((x): x is ApiProductOptionRow => x !== null);
  if (options.length === 0) return null;
  return { id, name, type, options };
}

function normalizeApiProduct(raw: unknown): ApiProduct {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      name: '',
      description: '',
      price: 0,
      xp: 0,
      merchantId: '',
      category: '',
      imageUrl: null,
    };
  }
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '');
  const name = String(r.name ?? r.Name ?? '');
  const description = String(r.description ?? r.Description ?? '');
  const price = readApiNumber(r.price ?? r.Price, 0);
  const xp = Math.trunc(readApiNumber(r.xp ?? r.Xp, 0));
  const merchantId = String(r.merchantId ?? r.MerchantId ?? '');
  const category = String(r.category ?? r.Category ?? '');
  const imageUrlRaw = r.imageUrl ?? r.ImageUrl;
  const imageUrl =
    typeof imageUrlRaw === 'string' && imageUrlRaw.trim() ? imageUrlRaw.trim() : null;

  const ogRaw = r.optionGroups ?? r.OptionGroups;
  let optionGroups: ApiProductOptionGroupRow[] | undefined;
  if (Array.isArray(ogRaw)) {
    const parsed = ogRaw
      .map((g) => normalizeApiProductOptionGroupRow(g))
      .filter((x): x is ApiProductOptionGroupRow => x !== null);
    if (parsed.length > 0) optionGroups = parsed;
  }

  return {
    id,
    name,
    description,
    price,
    xp,
    merchantId,
    category,
    imageUrl,
    optionGroups,
  };
}

export const api = {
  async getProducts(): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<unknown[]>('/Products', {
      params: { limit: 50, offset: 0 },
    });
    return Array.isArray(data) ? data.map(normalizeApiProduct) : [];
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
      const { data } = await apiClient.get<unknown[]>(
        `/Products/merchants/${encodeURIComponent(merchantId)}`,
        { params: { limit: pageSize, offset } },
      );
      const batch = Array.isArray(data) ? data.map(normalizeApiProduct) : [];
      all.push(...batch);
      if (batch.length < pageSize) break;
    }
    return all;
  },

  /**
   * `POST /Products` — JSON `CreateProductRequest` (camelCase, συμπ. `optionGroupsJson`).
   * Η εικόνα ανεβαίνει χωριστά με `uploadProductImage` αφού υπάρχει `productId`.
   */
  async createProduct(payload: CreateProductPayload, _merchantId?: string): Promise<void> {
    await apiClient.post('/Products', {
      name: payload.name,
      description: payload.description,
      category: payload.category,
      price: payload.price,
      xp: payload.xp,
      allergens: payload.allergens ?? null,
      optionGroupsJson: payload.optionGroupsJson ?? null,
    });
  },

  /**
   * `PUT /Products/{productId}` — JSON σώμα όπως `UpdateProductRequest` (camelCase).
   * Το `optionGroups` είναι υποχρεωτικό: το backend αντικαθιστά όλες τις ομάδες.
   * Η εικόνα ενημερώνεται χωριστά με `uploadProductImage` / `deleteProductImage`.
   */
  async updateProduct(
    productId: string,
    payload: {
      name: string;
      description: string;
      category: string;
      price: number;
      xp: number;
      allergens?: string[] | null;
      optionGroups: ProductOptionGroupApiPayload[];
    },
  ): Promise<void> {
    // Send both fields: the backend PUT may read either optionGroups (array) or
    // optionGroupsJson (serialized string). Sending both ensures the clear goes through.
    const optionGroupsJson = JSON.stringify(payload.optionGroups);
    await apiClient.put(`/Products/${encodeURIComponent(productId)}`, {
      name: payload.name,
      description: payload.description,
      category: payload.category,
      price: payload.price,
      xp: payload.xp,
      allergens: payload.allergens ?? null,
      optionGroups: payload.optionGroups,
      optionGroupsJson,
    });
  },

  /** `GET /merchants/product-option-groups` — template ομάδων επιλογών merchant (ρόλος Merchant). */
  async getMerchantProductOptionGroups(): Promise<ApiProductOptionGroupRow[]> {
    const { data } = await apiClient.get<unknown>('/merchants/product-option-groups');
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => normalizeApiProductOptionGroupRow(row))
      .filter((x): x is ApiProductOptionGroupRow => x !== null);
  },

  /** `PUT /merchants/product-option-groups` — αποθήκευση template ομάδων (ρόλος Merchant). */
  async upsertMerchantProductOptionGroups(groups: ProductOptionGroupApiPayload[]): Promise<void> {
    await apiClient.put('/merchants/product-option-groups', { groups });
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

  async getCustomerAnalytics(params?: { limit?: number; offset?: number }): Promise<CustomerAnalyticsItem[]> {
    const { data } = await apiClient.get<CustomerAnalyticsItem[]>('/Orders/customer-analytics', {
      params: { limit: Math.min(params?.limit ?? 50, 50), offset: params?.offset ?? 0 },
    });
    return Array.isArray(data) ? data : [];
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


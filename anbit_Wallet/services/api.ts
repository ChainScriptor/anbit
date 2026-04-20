import axios, { type AxiosInstance } from 'axios';
import { DashboardData, UserData, type ProductOptionGroupRow, type ProductOptionRow } from '../types';

// Χρησιμοποιούμε Vite proxy: /api → http://localhost:5057
const API_BASE_URL = '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const REFRESH_TOKEN_KEY = 'anbit_refresh_token';
const ACCESS_TOKEN_KEY = 'anbit_token';
const USER_KEY = 'anbit_user';
const LOGIN_RETURN_TO_KEY = 'anbit_login_return_to';

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token stored.');
  }

  // Call refresh endpoint and extract new access token
  const { data } = await apiClient.post<any>('/Auth/refresh', { refreshToken });

  const newAccessToken: string | undefined = data?.token ?? data?.accessToken ?? data?.access_token;
  const newRefreshToken: string | undefined = data?.refreshToken ?? data?.refresh_token;

  if (!newAccessToken) {
    throw new Error('Refresh succeeded but token is missing in response.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
  if (newRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }

  return newAccessToken;
}

function logoutAndNotify(message: string) {
  let returnTo = '/scan';
  if (typeof window !== 'undefined') {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentPath && !currentPath.startsWith('/login')) {
      returnTo = currentPath;
    }
    sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnTo);
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete apiClient.defaults.headers.common.Authorization;
  window.dispatchEvent(new CustomEvent('anbit:auth:401', { detail: { message } }));
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path !== '/login') {
      window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }
}

// On 401:
// 1) try refresh token
// 2) if refresh ok -> update token and retry the original request
// 3) if refresh failed -> logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as (any | undefined);

    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid infinite loop for refresh endpoint itself
      const url = originalRequest.url ?? '';
      if (String(url).includes('/Auth/refresh')) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.';
        logoutAndNotify(message);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        // While refreshPromise is in-flight, concurrent 401 requests wait here.
        const newAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(originalRequest);
      } catch {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.';
        logoutAndNotify(message);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

// Types matching backend OpenAPI
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  roles: string[];
  refreshToken?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
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
  allergens?: string[];
  optionGroups?: ProductOptionGroupRow[];
}

export interface QrCodeDetails {
  merchantId: string;
  tableId: number;
}

export interface UserXpBreakdownItem {
  id: string;
  userId: string;
  merchantId: string;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderListItem {
  id: string;
  userId: string;
  merchantId: string;
  tableNumber: number;
  items: { productId: string; quantity: number; unitPrice?: number; unitXp?: number }[];
  totalPrice: number;
  totalXp: number;
  /** Αν το backend το στέλνει (π.χ. εξαργύρωση XP στην παραγγελία). */
  spentXp?: number;
  status: number | string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiMerchantUser {
  id: string;
  username: string;
  email: string;
}

function normalizeOptionRows(raw: unknown): ProductOptionRow[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductOptionRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = row as Record<string, unknown>;
    const oid = String(o.id ?? o.Id ?? '').trim();
    if (!oid) continue;
    out.push({
      id: oid,
      name: String(o.name ?? o.Name ?? '').trim(),
      price: Number(o.price ?? o.Price ?? 0),
    });
  }
  return out;
}

function normalizeOptionGroups(raw: unknown): ProductOptionGroupRow[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: ProductOptionGroupRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const g = row as Record<string, unknown>;
    const id = String(g.id ?? g.Id ?? '').trim();
    if (!id) continue;
    const typeRaw = String(g.type ?? g.Type ?? 'Single');
    const type: 'Single' | 'Multiple' = typeRaw === 'Multiple' ? 'Multiple' : 'Single';
    const options = normalizeOptionRows(g.options ?? g.Options);
    if (options.length === 0) continue;
    out.push({
      id,
      name: String(g.name ?? g.Name ?? '').trim(),
      type,
      options,
    });
  }
  return out.length ? out : undefined;
}

function normalizeAllergens(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out = raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim());
  return out.length ? out : undefined;
}

function normalizeApiProduct(raw: unknown): ApiProduct | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '').trim();
  const merchantId = String(r.merchantId ?? r.MerchantId ?? '').trim();
  if (!id || !merchantId) return null;
  let ogRaw: unknown =
    r.optionGroups ?? r.OptionGroups ?? r.optionGroupsJson ?? r.OptionGroupsJson;
  if (typeof ogRaw === 'string') {
    try {
      ogRaw = JSON.parse(ogRaw) as unknown;
    } catch {
      ogRaw = undefined;
    }
  }
  const optionGroups = normalizeOptionGroups(ogRaw);
  const allergens = normalizeAllergens(r.allergens ?? r.Allergens);
  return {
    id,
    name: String(r.name ?? r.Name ?? '').trim(),
    description: String(r.description ?? r.Description ?? '').trim(),
    price: Number(r.price ?? r.Price ?? 0),
    xp: Number(r.xp ?? r.Xp ?? 0),
    merchantId,
    category: String(r.category ?? r.Category ?? '').trim() || 'Menu',
    imageUrl: (r.imageUrl ?? r.ImageUrl ?? null) as string | null,
    ...(allergens ? { allergens } : {}),
    ...(optionGroups ? { optionGroups } : {}),
  };
}

function normalizeApiProducts(raw: unknown): ApiProduct[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((row) => normalizeApiProduct(row))
    .filter((x): x is ApiProduct => x !== null);
}

function loginResponseToUserData(data: LoginResponse): UserData {
  return {
    id: data.userId,
    name: data.username,
    email: data.username,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.username)}`,
    roles: data.roles,
    totalXP: 0,
    storeXP: {},
    currentLevel: 1,
    currentLevelName: 'Starter',
    nextLevelXP: 100,
    levelProgress: 0,
    addresses: [],
  };
}

class ApiService {
  // Auth: POST /Auth/login — body: { username, password }
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/Auth/login', credentials);
    return data;
  }

  // Auth: POST /Auth/register — body: { username, email, password }
  async register(payload: RegisterRequest): Promise<void> {
    await apiClient.post('/Auth/register', payload);
  }

  // Data endpoints (use same client so Bearer is sent)
  async getUserProfile(): Promise<UserData> {
    const { data } = await apiClient.get<UserData>('/user/profile');
    return data;
  }

  async getDashboardData(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardData>('/dashboard');
    return data;
  }

  async getUserXP(params?: { limit?: number; offset?: number }): Promise<UserXpBreakdownItem[]> {
    const { data } = await apiClient.get<UserXpBreakdownItem[]>('/Identity/me/xp', {
      params: {
        limit: params?.limit ?? 100,
        offset: params?.offset ?? 0,
      },
    });
    return data;
  }

  async getProducts(
    params?: { limit?: number; offset?: number; merchantId?: string },
  ): Promise<ApiProduct[]> {
    const offset = params?.offset ?? 0;
    // Backend: GetProductsByMerchantIdQueryValidator — limit max 100
    const limit = Math.min(params?.limit ?? 50, 100);

    // For guest menu: prefer anonymous merchant endpoint.
    if (params?.merchantId) {
      const { data } = await apiClient.get<unknown>(
        `/Products/merchants/${encodeURIComponent(params.merchantId)}`,
        {
          params: { limit, offset },
        },
      );
      return normalizeApiProducts(data);
    }

    // For authenticated dashboard grouping: fall back to the general list.
    const { data } = await apiClient.get<unknown>('/Products', {
      params: { limit, offset },
    });
    return normalizeApiProducts(data);
  }

  /**
   * Merchant directory (ίδιο endpoint με admin merchant-users):
   * GET /Merchants?limit&offset
   */
  async getMerchantsDirectory(): Promise<ApiMerchantUser[]> {
    const pageSize = 100;
    const all: ApiMerchantUser[] = [];
    const seen = new Set<string>();

    for (let offset = 0; ; offset += pageSize) {
      const { data } = await apiClient.get<unknown[]>('/Merchants', {
        params: { limit: pageSize, offset },
      });
      const batch = Array.isArray(data) ? data : [];

      for (const row of batch) {
        if (!row || typeof row !== 'object') continue;
        const r = row as Record<string, unknown>;
        const id = String(r.id ?? r.Id ?? '').trim();
        if (!id) continue;
        const key = id.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        all.push({
          id,
          username: String(r.username ?? r.Username ?? '').trim() || `Merchant ${id.slice(0, 8)}`,
          email: String(r.email ?? r.Email ?? '').trim() || '—',
        });
      }

      if (batch.length < pageSize) break;
    }

    return all;
  }

  async getQrCodeDetails(shortCode: string): Promise<QrCodeDetails> {
    const { data } = await apiClient.get<QrCodeDetails>(`/QrCodes/${encodeURIComponent(shortCode)}`);
    return data;
  }

  async submitOrder(payload: unknown): Promise<{ success: true }> {
    // Backend currently returns `Ok()` without any body (no orderId).
    // We treat 200/201 as success.
    const resp = await apiClient.post('/Orders', payload);
    if (resp.status === 200 || resp.status === 201) {
      return { success: true };
    }
    throw new Error(`Unexpected response status: ${resp.status}`);
  }

  async getOrders(params?: { limit?: number; offset?: number }): Promise<ApiOrderListItem[]> {
    // Backend: limit must be ≤ 100 (validation).
    const limit = Math.min(Math.max(params?.limit ?? 100, 1), 100);
    const offset = Math.max(params?.offset ?? 0, 0);
    const { data } = await apiClient.get<ApiOrderListItem[]>('/Orders', {
      params: { limit, offset },
    });
    return data;
  }

  async getLatestOrder(params: {
    userId: string;
    merchantId: string;
    tableNumber?: number;
  }): Promise<{
    id: string;
    userId: string;
    merchantId: string;
    tableNumber: number;
    items: { productId: string; quantity: number; unitPrice?: number; unitXp?: number }[];
    totalPrice: number;
    totalXp: number;
    status: number | string;
    createdAt: string;
    updatedAt?: string;
  } | null> {
    const { data } = await apiClient.get<any[]>('/Orders', {
      params: { limit: 100, offset: 0 },
    });

    const orders = Array.isArray(data) ? data : [];

    const normalizedUserId = params.userId?.toLowerCase?.() ?? '';
    const normalizedMerchantId = params.merchantId?.toLowerCase?.() ?? '';

    const filtered = orders.filter((o) => {
      const uid = String(o?.userId ?? '').toLowerCase();
      const mid = String(o?.merchantId ?? '').toLowerCase();
      if (uid !== normalizedUserId) return false;
      if (mid !== normalizedMerchantId) return false;
      if (typeof params.tableNumber === 'number' && o?.tableNumber !== params.tableNumber) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const at = new Date(a?.createdAt ?? 0).getTime();
      const bt = new Date(b?.createdAt ?? 0).getTime();
      return bt - at; // desc
    });

    return filtered[0] ?? null;
  }

  /** GET /Orders/{orderId} — για χρήστη, επιστρέφει την παραγγελία του */
  async getOrder(orderId: string): Promise<{
    id: string;
    userId: string;
    merchantId: string;
    tableNumber: number;
    items: { productId: string; quantity: number; unitPrice?: number; unitXp?: number }[];
    totalPrice: number;
    totalXp: number;
    status: number | string;
    createdAt: string;
    updatedAt: string;
  }> {
    const { data } = await apiClient.get(`/Orders/${encodeURIComponent(orderId)}`);
    return data;
  }
}

export const api = new ApiService();
export { loginResponseToUserData };

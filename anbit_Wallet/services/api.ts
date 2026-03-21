import axios, { type AxiosInstance } from 'axios';
import { DashboardData, UserData } from '../types';

// Χρησιμοποιούμε Vite proxy: /api → http://localhost:5057
const API_BASE_URL = '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('anbit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const REFRESH_TOKEN_KEY = 'anbit_refresh_token';

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

  localStorage.setItem('anbit_token', newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }

  return newAccessToken;
}

function logoutAndNotify(message: string) {
  localStorage.removeItem('anbit_token');
  localStorage.removeItem('anbit_user');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('anbit:auth:401', { detail: { message } }));
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
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;

    // For guest menu: prefer anonymous merchant endpoint.
    if (params?.merchantId) {
      const { data } = await apiClient.get<ApiProduct[]>(
        `/Products/merchants/${encodeURIComponent(params.merchantId)}`,
        {
          params: { limit, offset },
        },
      );
      return data;
    }

    // For authenticated dashboard grouping: fall back to the general list.
    const { data } = await apiClient.get<ApiProduct[]>('/Products', {
      params: { limit, offset },
    });
    return data;
  }

  async getQrCodeDetails(shortCode: string): Promise<QrCodeDetails> {
    const { data } = await apiClient.get<QrCodeDetails>(`/QrCodes/${encodeURIComponent(shortCode)}`);
    return data;
  }

  async submitOrder(payload: unknown): Promise<{ orderId: string }> {
    const { data } = await apiClient.post<{ orderId: string }>('/Orders', payload);
    return data;
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
    status: number;
    createdAt: string;
    updatedAt: string;
  }> {
    const { data } = await apiClient.get(`/Orders/${encodeURIComponent(orderId)}`);
    return data;
  }
}

export const api = new ApiService();
export { loginResponseToUserData };

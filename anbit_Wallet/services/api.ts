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

// On 401, clear token and notify app (no full-page redirect – React will handle navigation and messages)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anbit_token');
      localStorage.removeItem('anbit_user');
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.';
      window.dispatchEvent(new CustomEvent('anbit:auth:401', { detail: { message } }));
    }
    return Promise.reject(error);
  }
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
}

export interface QrCodeDetails {
  merchantId: string;
  tableId: number;
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

  async getProducts(params?: { limit?: number; offset?: number }): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<ApiProduct[]>('/Products', {
      params: { limit: params?.limit ?? 50, offset: params?.offset ?? 0 },
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

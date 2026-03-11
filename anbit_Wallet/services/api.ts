import axios, { type AxiosInstance } from 'axios';
import { DashboardData, UserData } from '../types';

const API_BASE_URL = 'http://localhost:5057/api/v1';

const apiClient: AxiosInstance = axios.create({
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

// On 401, clear token and reload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anbit_token');
      localStorage.removeItem('anbit_user');
      window.location.reload();
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

  async submitOrder(payload: unknown): Promise<unknown> {
    const { data } = await apiClient.post('/orders/create', payload);
    return data;
  }
}

export const api = new ApiService();
export { loginResponseToUserData };

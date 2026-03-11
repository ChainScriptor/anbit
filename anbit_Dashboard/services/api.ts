
import axios, { type AxiosInstance } from 'axios';
import type { Product } from '../types';

const API_BASE_URL = 'http://localhost:5057/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
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
}

export interface ApiOrder {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export const api = {
  async getProducts(): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<ApiProduct[]>('/Products');
    return data;
  },

  async createProduct(payload: {
    name: string;
    description: string;
    price: number;
    xp: number;
  }): Promise<void> {
    await apiClient.post('/Products', payload);
  },

  async getOrders(): Promise<ApiOrder[]> {
    const { data } = await apiClient.get<ApiOrder[]>('/Orders');
    return data;
  },
};


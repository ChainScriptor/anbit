
import axios, { type AxiosInstance } from 'axios';
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

export const api = {
  async getProducts(): Promise<ApiProduct[]> {
    const { data } = await apiClient.get<ApiProduct[]>('/Products', {
      params: { limit: 50, offset: 0 },
    });
    return data;
  },

  async createProduct(
    formData: FormData,
    merchantId?: string
  ): Promise<void> {
    await apiClient.post('/Products', formData, {
      params: merchantId ? { merchantId } : undefined,
    });
  },

  async getMerchants(): Promise<ApiMerchantUser[]> {
    const { data } = await apiClient.get<ApiMerchantUser[]>('/Auth/merchants');
    return data;
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


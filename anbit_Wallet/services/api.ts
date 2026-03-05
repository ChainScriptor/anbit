
import { DashboardData, UserData, SavedAddress } from '../types';

// In a real scenario, this would be your C# Backend URL
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('anbit_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Generic request wrapper
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        localStorage.removeItem('anbit_token');
        window.location.reload();
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API Error' }));
        throw new Error(error.message || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  async login(credentials: any) {
    // Simulated backend call - Replace with actual POST /api/auth/login
    console.log('Authenticating with backend...', credentials);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validation logic for test user
        const { email, password } = credentials;
        
        if (email === 'test@anbit.gr' && password === 'warrior') {
          const addresses: SavedAddress[] = [
            { id: 'addr_1', label: 'Σπίτι', address: 'Θεσσαλονίκη, Εγνατία 78', coordinates: '40.6401° N, 22.9444° E', isDefault: true },
            { id: 'addr_2', label: 'Γραφείο', address: 'Θεσσαλονίκη, Τσιμισκή 15', coordinates: '40.6321° N, 22.9480° E', isDefault: false },
          ];
          resolve({
            token: 'mock_jwt_token_test_user_' + Math.random().toString(36).substr(2),
            user: {
              id: 'user_999',
              name: 'Test Warrior',
              email: 'test@anbit.gr',
              avatar: 'https://i.pravatar.cc/150?u=test_warrior',
              totalXP: 500,
              storeXP: {},
              currentLevel: 2,
              currentLevelName: 'Bronze Recruit',
              nextLevelXP: 1000,
              levelProgress: 50.0,
              addresses,
            }
          });
        } else if (email === 'stathis@anbit.gr') {
          const addresses: SavedAddress[] = [
            { id: 'addr_1', label: 'Σπίτι', address: 'Θεσσαλονίκη, Τσιμισκή 42', coordinates: '40.6342° N, 22.9476° E', isDefault: true },
            { id: 'addr_2', label: 'Δουλειά', address: 'Θεσσαλονίκη, Εγνατία 100', coordinates: '40.6380° N, 22.9420° E', isDefault: false },
          ];
          resolve({
            token: 'mock_jwt_token_stathis_' + Math.random().toString(36).substr(2),
            user: {
              id: 'user_001',
              name: 'Stathis',
              email: 'stathis@anbit.gr',
              avatar: 'https://i.pravatar.cc/150?u=stathis',
              totalXP: 1250,
              storeXP: {},
              currentLevel: 5,
              currentLevelName: 'Gold Warrior',
              nextLevelXP: 2000,
              levelProgress: 62.5,
              addresses,
            }
          });
        } else {
          // Reject for any other credentials to test error state
          reject(new Error('Invalid credentials. Access denied by Node.'));
        }
      }, 1500);
    });
  }

  // Data Endpoints
  async getUserProfile(): Promise<UserData> {
    return this.request<UserData>('/user/profile');
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>('/dashboard');
  }

  async submitOrder(payload: any) {
    return this.request('/orders/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiService();


import { Order, Booking, Product } from '../types';

// Αντικατάστησε το URL με αυτό του δικού σου C# API (π.χ. https://localhost:7001/api)
const BASE_URL = 'https://your-csharp-backend.com/api';

export const api = {
  // Παράδειγμα λήψης παραγγελιών
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${BASE_URL}/orders`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Παράδειγμα επιβεβαίωσης παραγγελίας (POST)
  confirmOrder: async (orderId: string): Promise<boolean> => {
    const response = await fetch(`${BASE_URL}/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  },

  // Λήψη οικονομικών στοιχείων για το Dashboard
  getAnalytics: async () => {
    const response = await fetch(`${BASE_URL}/analytics`);
    return await response.json();
  }
};

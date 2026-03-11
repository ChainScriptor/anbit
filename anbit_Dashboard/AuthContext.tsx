import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface DashboardUser {
  id: string;
  username: string;
  roles: string[];
}

interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: DashboardUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Relative path: Vite proxy forwards /api to http://localhost:5057
const API_BASE_URL = '/api/v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('anbit_dashboard_token') : null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = localStorage.getItem('anbit_dashboard_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Backend may send "error" (camelCase) or "Error" (PascalCase)
        const message =
          (data && typeof (data.error ?? data.Error) === 'string' && (data.error ?? data.Error)) ||
          (response.status === 400
            ? 'Λάθος username ή κωδικός. Ελέγξτε τα στοιχεία σας ή ότι ο χρήστης υπάρχει στη βάση.'
            : 'Αποτυχία σύνδεσης. Δοκιμάστε ξανά.');
        throw new Error(message);
      }

      const loginData = data as LoginResponse;

      const roles = loginData.roles ?? [];
      const hasDashboardRole = roles.includes('Admin') || roles.includes('Merchant');

      // Αν ο χρήστης δεν είναι Admin ή Merchant, δεν επιτρέπουμε πρόσβαση
      if (!hasDashboardRole) {
        logout();
        throw new Error('Δεν έχετε δικαιώματα πρόσβασης στο Dashboard.');
      }

      setToken(loginData.token);
      const dashboardUser: DashboardUser = {
        id: loginData.userId,
        username: loginData.username,
        roles,
      };
      setUser(dashboardUser);

      localStorage.setItem('anbit_dashboard_token', loginData.token);
      localStorage.setItem('anbit_dashboard_user', JSON.stringify(dashboardUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('anbit_dashboard_token');
      localStorage.removeItem('anbit_dashboard_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};


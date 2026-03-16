import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type SessionInfo = {
  merchantId: string;
  tableNumber: number;
};

type OrderContextType = {
  session: SessionInfo | null;
  setSession: (info: SessionInfo) => void;
  clearSession: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<SessionInfo | null>(null);

  const setSession = useCallback((info: SessionInfo) => {
    setSessionState(info);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  return (
    <OrderContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return ctx;
};


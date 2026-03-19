import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import OrdersDashboard from '@/pages/OrdersDashboard';
import Products from '@/pages/Products';
import ReservationList from '@/pages/ReservationList';
import ViewTables from '@/pages/ViewTables';
import TableHistory from '@/pages/TableHistory';
import Help from '@/pages/Help';
import Customers from '@/pages/Customers';
import AuthPage from '@/pages/Auth';
import AdminPage from '@/pages/Admin';
import StoresManagement from '@/pages/StoresManagement';
import MerchantUsers from '@/pages/MerchantUsers';
import SystemSettings from '@/pages/SystemSettings';
import AdminUsers from '@/pages/AdminUsers';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Merchant']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersDashboard />} />
              <Route path="/reservation-list" element={<ReservationList />} />
              <Route path="/view-tables" element={<ViewTables />} />
              <Route path="/table-history" element={<TableHistory />} />
              <Route path="/help" element={<Help />} />
              <Route path="/customers" element={<Customers />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['Merchant']} />}>
              <Route path="/products" element={<Products />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/stores" element={<StoresManagement />} />
              <Route path="/admin/merchant-users" element={<MerchantUsers />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

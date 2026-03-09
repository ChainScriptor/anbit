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

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersDashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reservation-list" element={<ReservationList />} />
          <Route path="/view-tables" element={<ViewTables />} />
          <Route path="/table-history" element={<TableHistory />} />
          <Route path="/help" element={<Help />} />
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;

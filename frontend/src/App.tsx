import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import TenantsPage from './pages/TenantsPage';
import OrdersPage from './pages/OrdersPage';
import TenantDetailsPage from './pages/TenantDetailsPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex' }}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/tenants/:tenantId" element={<TenantDetailsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;

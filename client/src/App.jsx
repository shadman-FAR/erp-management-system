import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import UsersPage from './pages/UsersPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={
          <RoleRoute roles={['admin', 'sales']}>
            <CustomersPage />
          </RoleRoute>
        } />
        <Route path="suppliers" element={
          <RoleRoute roles={['admin', 'purchase']}>
            <SuppliersPage />
          </RoleRoute>
        } />
        <Route path="users" element={
          <RoleRoute roles={['admin']}>
            <UsersPage />
          </RoleRoute>
        } />
        <Route path="sales-orders" element={
          <Box sx={{ p: 3 }}>
            <Typography variant="h5">Sales Orders — Coming Day 4</Typography>
          </Box>
        } />
        <Route path="purchase-orders" element={
          <Box sx={{ p: 3 }}>
            <Typography variant="h5">Purchase Orders — Coming Day 4</Typography>
          </Box>
        } />
        <Route path="grn" element={
          <Box sx={{ p: 3 }}>
            <Typography variant="h5">GRN — Coming Day 5</Typography>
          </Box>
        } />
        <Route path="invoices" element={
          <Box sx={{ p: 3 }}>
            <Typography variant="h5">Invoices — Coming Day 5</Typography>
          </Box>
        } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
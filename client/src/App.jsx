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
import SalesOrdersPage from './pages/SalesOrdersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import GRNPage from './pages/GRNPage';
import InvoicesPage from './pages/InvoicesPage';
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
        <Route path="sales-orders" element={
          <RoleRoute roles={['admin', 'sales']}>
            <SalesOrdersPage />
          </RoleRoute>
        } />
        <Route path="purchase-orders" element={
          <RoleRoute roles={['admin', 'purchase', 'inventory']}>
            <PurchaseOrdersPage />
          </RoleRoute>
        } />
        <Route path="grn" element={
          <RoleRoute roles={['admin', 'purchase', 'inventory']}>
            <GRNPage />
          </RoleRoute>
        } />
        <Route path="invoices" element={
          <RoleRoute roles={['admin', 'sales']}>
            <InvoicesPage />
          </RoleRoute>
        } />
        <Route path="users" element={
          <RoleRoute roles={['admin']}>
            <UsersPage />
          </RoleRoute>
        } />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
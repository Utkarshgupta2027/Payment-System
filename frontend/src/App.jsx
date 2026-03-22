import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/RegisterPage';
import DashboardPage          from './pages/DashboardPage';
import SendMoneyPage          from './pages/SendMoneyPage';
import AddMoneyPage           from './pages/AddMoneyPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import QrCodePage            from './pages/QrCodePage';
import ScannerPage           from './pages/ScannerPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes inside shared Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/send"      element={<SendMoneyPage />} />
            <Route path="/add-money" element={<AddMoneyPage />} />
            <Route path="/history"   element={<TransactionHistoryPage />} />
            <Route path="/qr-code"   element={<QrCodePage />} />
            <Route path="/scanner"   element={<ScannerPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

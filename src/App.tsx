/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';

// Pages (will create these next)
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/Overview';
import Cashier from './pages/Cashier';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Zakat from './pages/Zakat';
import Reports from './pages/Reports';
import Clerking from './pages/Clerking';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-sans">Loading umkmoo's...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Overview />} />
                  <Route path="cashier" element={<Cashier />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="zakat" element={<Zakat />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="clerking" element={<Clerking />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './login';
import Signup from './SignUp';
import LandingPage from './LandingPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  const [isOffline, setIsOffline] = useState(false);

  const isElectron = () => {
    return navigator.userAgent.indexOf('Electron') !== -1 || 
           (window && window.process && window.process.versions && window.process.versions.electron);
  };
  
  const isElectronOffline = () => {
    const isElectronApp = isElectron();
    const isOffline = !navigator.onLine;
    
    return isElectronApp && isOffline;
  };

  const isAuthenticated = () => {
    // Make sure this check is reliable
    const user = localStorage.getItem('user');
    return user !== null && user !== undefined;
  };

  const isAdminAuthenticated = () => {
    // Check if admin is logged in
    const adminUser = localStorage.getItem('adminUser');
    return adminUser !== null && adminUser !== undefined;
  };

  useEffect(() => {
    // Update offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    // If it's an Electron app in offline mode, always allow access to dashboard
    if (isElectronOffline() || isAuthenticated()) {
      return children;
    }
    return <Navigate to="/login" />;
  };

  const AdminProtectedRoute = ({ children }) => {
    if (isAdminAuthenticated()) {
      return children;
    }
    return <Navigate to="/admin" />;
  };

  const PublicRoute = ({ children }) => {
    // If it's an Electron app in offline mode, redirect to dashboard
    if (isElectronOffline() || isAuthenticated()) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  // In Electron app, we skip the landing page
  if (isElectron()) {
    return (
      <HashRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated() 
                ? <Navigate to="/dashboard" /> 
                : <Navigate to="/login" />
            }
          />
          <Route 
            path="*" 
            element={<Navigate to="/login" />}
          />
        </Routes>
      </HashRouter>
    );
  }

  // For web application, include the landing page and admin routes
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
            } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './login';
import Signup from './SignUp';
import LandingPage from './LandingPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from './TermsOfService';


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
    const user = localStorage.getItem('user');
    return user !== null && user !== undefined;
  };

  const isAdminAuthenticated = () => {

    const adminUser = localStorage.getItem('adminUser');
    return adminUser !== null && adminUser !== undefined;
  };

  useEffect(() => {
  
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);


    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    return children;
  };

  const AdminProtectedRoute = ({ children }) => {
    if (isAdminAuthenticated()) {
      return children;
    }
    return <Navigate to="/admin" />;
  };

  const PublicRoute = ({ children }) => {
    if (isElectronOffline()) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

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
              <Dashboard />
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to="/dashboard" />
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


  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
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
            <Dashboard />
          } 
        />
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
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
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '976765633681-2fct57jpqv111tfb5sroeqcqcakenk9c.apps.googleusercontent.com';

function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  const isElectron = () => {
    return navigator.userAgent.indexOf('Electron') !== -1 || 
           (window && window.process && window.process.versions && window.process.versions.electron);
  };
  
  const isElectronOffline = () => {
    const isElectronApp = isElectron();
    const isOffline = !navigator.onLine;
    
    return isElectronApp && isOffline;
  };

  const checkIsAuthenticated = () => {
    const user = localStorage.getItem('user');
    const authSuccess = localStorage.getItem('auth_success_timestamp');
    
    // Consider user authenticated if user data exists
    return user !== null && user !== undefined;
  };

  const isAdminAuthenticated = () => {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser !== null && adminUser !== undefined;
  };

  // Handle auth events
  useEffect(() => {
    // Check authentication status on initial load
    setIsAuthenticated(checkIsAuthenticated());
    setInitialAuthCheckDone(true);
    
    // Listen for custom authentication success events
    const handleAuthSuccess = () => {
      console.log('Auth success event detected');
      setIsAuthenticated(true);
    };
    
    window.addEventListener('auth_success_event', handleAuthSuccess);
    
    // Clean up
    return () => {
      window.removeEventListener('auth_success_event', handleAuthSuccess);
    };
  }, []);
  
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

  // Check auth status periodically in Electron
  useEffect(() => {
    if (isElectron()) {
      const authCheckInterval = setInterval(() => {
        const isCurrentlyAuthenticated = checkIsAuthenticated();
        if (isCurrentlyAuthenticated !== isAuthenticated) {
          setIsAuthenticated(isCurrentlyAuthenticated);
        }
      }, 1000);
      
      return () => clearInterval(authCheckInterval);
    }
  }, [isAuthenticated]);

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

    // In Electron, bypass login if authenticated
    if (isElectron() && isAuthenticated && initialAuthCheckDone) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  if (isElectron()) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                initialAuthCheckDone && isAuthenticated
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
      </GoogleOAuthProvider>
    );
  }

  // Web app routing remains the same
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
    </GoogleOAuthProvider>
  );
}

export default App;
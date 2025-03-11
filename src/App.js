import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './login';
import Signup from './SignUp';

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

  const PublicRoute = ({ children }) => {
    // If it's an Electron app in offline mode, redirect to dashboard
    if (isElectronOffline() || isAuthenticated()) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

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
          element={<Navigate to="/login" />}
        />
        <Route 
          path="*" 
          element={<Navigate to="/login" />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './login';
import Signup from './SignUp';

function App() {
  const isAuthenticated = () => {
    // Make sure this check is reliable
    const user = localStorage.getItem('user');
    return user !== null && user !== undefined;
  };

  const ProtectedRoute = ({ children }) => {
    if (isAuthenticated()) {
      return children;
    }
    return <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
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
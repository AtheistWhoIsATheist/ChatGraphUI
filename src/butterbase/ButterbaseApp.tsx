import React, { useState, useEffect } from 'react';
import { ButterbaseAuth } from './components/Auth';
import { ButterbaseDashboard } from './components/Dashboard';

export default function ButterbaseApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bb_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated) {
    return <ButterbaseDashboard onLogout={() => {
      localStorage.removeItem('bb_token');
      setIsAuthenticated(false);
    }} />;
  }

  return <ButterbaseAuth onLogin={() => setIsAuthenticated(true)} />;
}

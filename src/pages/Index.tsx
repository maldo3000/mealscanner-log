
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    console.log("Index page - Auth status:", isAuthenticated ? "Authenticated" : "Not authenticated");
  }, [isAuthenticated]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // If authenticated, redirect to app home, otherwise to landing page
  return isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/" />;
};

export default Index;

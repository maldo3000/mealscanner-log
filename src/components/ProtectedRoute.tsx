
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - Current path:", location.pathname);
  console.log("ProtectedRoute - Auth state:", { isLoading, isAuthenticated: !!user });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - Redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  console.log("ProtectedRoute - Rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;

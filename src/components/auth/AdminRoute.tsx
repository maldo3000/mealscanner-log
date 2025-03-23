
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading, user, checkUserRole } = useAuth();

  // Force a role check when the component mounts
  useEffect(() => {
    console.log("AdminRoute - Current user:", user?.email);
    console.log("AdminRoute - isAdmin:", isAdmin);
    // Refresh the role check
    if (user) {
      console.log("AdminRoute - Checking admin role");
      checkUserRole();
    }
  }, [user, checkUserRole, isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAdmin) {
    console.log("Access denied - user is not an admin");
    return <Navigate to="/home" replace />;
  }

  console.log("Access granted - user is an admin");
  return <>{children}</>;
};

export default AdminRoute;

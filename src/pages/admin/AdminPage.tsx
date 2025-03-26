
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './components/AdminDashboard';
import AccessDenied from './components/AccessDenied';

const AdminPage: React.FC = () => {
  const { isAdmin, session, checkUserRole } = useAuth();
  
  // Force a role check when the admin page loads
  useEffect(() => {
    checkUserRole();
    console.log("AdminPage - Checking admin role, current status:", isAdmin);
  }, [checkUserRole]);

  if (!isAdmin) {
    console.log("AdminPage - Access denied");
    return <AccessDenied />;
  }

  console.log("AdminPage - Access granted, rendering dashboard");
  return (
    <AdminProvider session={session}>
      <AdminDashboard />
    </AdminProvider>
  );
};

export default AdminPage;

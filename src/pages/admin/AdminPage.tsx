
import React from 'react';
import { useAuth } from '@/context/auth';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './components/AdminDashboard';
import AccessDenied from './components/AccessDenied';

const AdminPage: React.FC = () => {
  const { isAdmin, session } = useAuth();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AdminProvider session={session}>
      <AdminDashboard />
    </AdminProvider>
  );
};

export default AdminPage;

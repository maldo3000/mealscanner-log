
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  LoadingState,
  RefreshButton,
  DashboardTabs,
  DashboardHeader
} from './dashboard';

const AdminDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isLoading,
    loadSettings,
    loadInviteCodes
  } = useAdmin();

  const handleRefresh = () => {
    loadSettings();
    loadInviteCodes();
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <DashboardHeader />
      
      <DashboardTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <RefreshButton onRefresh={handleRefresh} />
    </div>
  );
};

export default AdminDashboard;

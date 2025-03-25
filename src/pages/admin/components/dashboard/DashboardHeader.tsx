
import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Badge } from '@/components/ui/badge';

const DashboardHeader: React.FC = () => {
  const { paywallEnabled, freeTierLimit } = useAdmin();
  
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant={paywallEnabled ? "default" : "outline"}>
          Paywall {paywallEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
        {paywallEnabled && (
          <Badge variant="secondary">
            Free Tier: {freeTierLimit} scans
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;

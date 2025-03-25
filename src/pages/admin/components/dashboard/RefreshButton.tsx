
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RefreshButtonProps {
  onRefresh: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  return (
    <div className="mt-8">
      <Button 
        variant="outline" 
        onClick={() => {
          onRefresh();
          toast.info('Refreshing settings from database...');
        }}
        className="w-full"
      >
        Refresh All Settings
      </Button>
    </div>
  );
};

export default RefreshButton;

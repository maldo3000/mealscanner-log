
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface PaywallToggleProps {
  paywallEnabled: boolean;
  onToggle: (checked: boolean) => void;
  disabled: boolean;
}

const PaywallToggle: React.FC<PaywallToggleProps> = ({ 
  paywallEnabled, 
  onToggle, 
  disabled 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Enable Paywall</h3>
          <p className="text-sm text-muted-foreground">
            When enabled, users will be limited to the free tier scan limit
          </p>
        </div>
        <Switch 
          checked={paywallEnabled} 
          onCheckedChange={onToggle}
          disabled={disabled}
        />
      </div>
      
      <Alert className={!paywallEnabled ? "bg-muted/50" : ""}>
        <Info className="h-4 w-4" />
        <AlertTitle>Paywall Status</AlertTitle>
        <AlertDescription>
          Paywall is currently {paywallEnabled ? 'enabled' : 'disabled'}. 
          Users {paywallEnabled ? 'will' : 'will not'} be limited to the free tier.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PaywallToggle;

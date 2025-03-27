
export interface SubscriptionContextType {
  scanCount: number;
  isSubscribed: boolean;
  freeTierLimit: number;
  paywallEnabled: boolean;
  subscriptionEndDate: Date | null;
  loadingSubscription: boolean;
  remainingScans: number;
  canScan: boolean;
  incrementScanCount: () => Promise<boolean>;
  pricing: PricingInfo | null;
  setIsSubscribed: (value: boolean) => void;
  refreshSubscriptionData: () => void; // Add this function to the context
}

export interface PricingInfo {
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
}

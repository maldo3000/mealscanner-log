
/**
 * Types for subscription context
 */

export interface PricingInfo {
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
}

export interface SubscriptionContextType {
  scanCount: number;
  isSubscribed: boolean;
  freeTierLimit: number;
  paywallEnabled: boolean;
  remainingScans: number;
  canScan: boolean;
  incrementScanCount: () => Promise<boolean>;
  subscriptionEndDate: Date | null;
  loadingSubscription: boolean;
  pricing: PricingInfo | null;
}

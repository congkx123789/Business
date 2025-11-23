export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  libraryScope?: string;
}



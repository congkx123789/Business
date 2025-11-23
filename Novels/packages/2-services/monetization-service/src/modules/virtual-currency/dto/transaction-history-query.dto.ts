export interface TransactionHistoryQueryDto {
  userId: string;
  page?: number;
  limit?: number;
  types?: Array<"topup" | "purchase" | "refund" | "reward" | "adjustment">;
}



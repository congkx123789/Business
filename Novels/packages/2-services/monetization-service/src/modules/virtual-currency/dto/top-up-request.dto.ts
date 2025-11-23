export interface TopUpRequestDto {
  userId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}



export interface DeductPointsDto {
  userId: string;
  amount: number;
  referenceId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}



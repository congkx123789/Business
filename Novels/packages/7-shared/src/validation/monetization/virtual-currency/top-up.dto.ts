// Top-up DTO

import { IsNumber, IsNotEmpty, Min, IsEnum } from 'class-validator';

export class TopUpDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount!: number; // In real currency (CNY)

  @IsEnum(['alipay', 'wechat', 'credit-card', 'bank-transfer'])
  @IsNotEmpty()
  paymentMethod!: 'alipay' | 'wechat' | 'credit-card' | 'bank-transfer';
}


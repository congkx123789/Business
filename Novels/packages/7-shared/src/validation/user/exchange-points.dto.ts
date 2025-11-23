// Exchange Points for Fast Pass DTO

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ExchangePointsDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @Min(1)
  pointsAmount!: number; // Amount of points to exchange

  @IsNumber()
  @Min(1)
  fastPassCount!: number; // Number of Fast Passes to receive
}


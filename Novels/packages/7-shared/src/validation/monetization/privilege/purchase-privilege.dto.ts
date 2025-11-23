// Purchase Privilege DTO

import { IsString, IsNotEmpty } from 'class-validator';

export class PurchasePrivilegeDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;
}


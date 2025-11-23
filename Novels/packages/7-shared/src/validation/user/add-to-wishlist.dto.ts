// Add to Wishlist DTO

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddToWishlistDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}


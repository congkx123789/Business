import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromWishlistDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;
}


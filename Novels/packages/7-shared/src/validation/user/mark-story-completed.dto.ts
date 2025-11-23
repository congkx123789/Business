import { IsNotEmpty, IsString } from 'class-validator';

export class MarkStoryCompletedDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;
}


import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFilteredViewDto {
  @IsString()
  @IsNotEmpty()
  viewId!: string;
}


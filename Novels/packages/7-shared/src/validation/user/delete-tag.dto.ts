import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteTagDto {
  @IsString()
  @IsNotEmpty()
  tagId!: string;
}


import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class KeyboardShortcutDto {
  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  key!: string;
}

export class UpdateKeyboardShortcutsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyboardShortcutDto)
  shortcuts!: KeyboardShortcutDto[];
}


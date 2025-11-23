import { IsBoolean, IsEnum, IsInt } from "class-validator";

export class UpsertLibraryItemDto {
  @IsInt()
  bookId!: number;

  @IsEnum(["reading", "completed", "planned"], {
    message: "status must be one of reading, completed, planned"
  })
  status!: "reading" | "completed" | "planned";

  @IsBoolean()
  favorite!: boolean;

  @IsBoolean()
  downloaded!: boolean;
}

import { Module } from "@nestjs/common";
import { ReadingPreferencesService } from "./reading-preferences.service";

@Module({
  providers: [ReadingPreferencesService],
  exports: [ReadingPreferencesService],
})
export class ReadingPreferencesModule {}





























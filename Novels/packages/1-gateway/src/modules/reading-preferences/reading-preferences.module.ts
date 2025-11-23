import { Module } from "@nestjs/common";
import { UsersClientModule } from "../../clients/users-client.module";
import { ReadingPreferencesController } from "./reading-preferences.controller";
import { ReadingPreferencesResolver } from "./reading-preferences.resolver";
import { ReadingPreferencesService } from "./reading-preferences.service";

@Module({
  imports: [UsersClientModule],
  controllers: [ReadingPreferencesController],
  providers: [ReadingPreferencesService, ReadingPreferencesResolver],
})
export class ReadingPreferencesModule {}
















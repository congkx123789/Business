import { Module } from "@nestjs/common";
import { UsersClientModule } from "../../clients/users-client.module";
import { UsersController } from "./users.controller";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";
import { GamificationController } from "./gamification.controller";
import { GamificationResolver } from "./gamification.resolver";
import { GamificationService } from "./gamification.service";

@Module({
  imports: [UsersClientModule],
  controllers: [UsersController, GamificationController],
  providers: [
    UsersService,
    UsersResolver,
    GamificationService,
    GamificationResolver,
  ],
  exports: [UsersService, GamificationService],
})
export class UsersModule {}

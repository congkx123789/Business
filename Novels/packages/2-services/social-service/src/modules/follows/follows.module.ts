import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../../events/events.module";
import { FollowsService } from "./follows.service";

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}



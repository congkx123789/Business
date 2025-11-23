import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityTrackingService } from "./activity-tracking.service";
import { EventsModule } from "../../events/events.module";

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [ActivityTrackingService],
  exports: [ActivityTrackingService],
})
export class ActivityTrackingModule {}



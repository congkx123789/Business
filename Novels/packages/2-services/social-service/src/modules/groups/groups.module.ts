import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../../events/events.module";
import { GroupsService } from "./groups.service";
import { BookClubsService } from "./book-clubs.service";

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [GroupsService, BookClubsService],
  exports: [GroupsService, BookClubsService],
})
export class GroupsModule {}



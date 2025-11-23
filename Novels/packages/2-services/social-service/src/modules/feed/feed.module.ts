import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { CacheModule } from "../../common/cache/cache.module";
import { FeedService } from "./feed.service";

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}



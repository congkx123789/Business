import { Module } from "@nestjs/common";
import { AuthorDashboardService } from "./author-dashboard.service";
import { AuthorAnalyticsService } from "./author-analytics.service";
import { MonetizationClientModule } from "../../clients/monetization-client.module";
import { CommunityClientModule } from "../../clients/community-client.module";
import { UsersClientModule } from "../../clients/users-client.module";
import { CacheModule } from "../../common/cache/cache.module";
import { DatabaseModule } from "../../common/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    MonetizationClientModule,
    CommunityClientModule,
    UsersClientModule,
  ],
  providers: [AuthorDashboardService, AuthorAnalyticsService],
  exports: [AuthorDashboardService, AuthorAnalyticsService],
})
export class AuthorModule {}

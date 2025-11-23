import { Module } from "@nestjs/common";
import { AIClientModule } from "../../clients/ai-client.module";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { RecommendationsController } from "./recommendations.controller";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationsResolver } from "./recommendations.resolver";

@Module({
  imports: [AIClientModule, StoriesClientModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsResolver],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}


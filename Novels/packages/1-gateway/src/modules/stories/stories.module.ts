import { Module } from "@nestjs/common";
import { StoriesController } from "./stories.controller";
import { StoriesResolver } from "./stories.resolver";
import { StoriesService } from "./stories.service";
import { StoriesClientModule } from "../../clients/stories-client.module";

@Module({
  imports: [StoriesClientModule],
  controllers: [StoriesController],
  providers: [StoriesResolver, StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}


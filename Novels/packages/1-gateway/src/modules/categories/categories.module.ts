import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [StoriesClientModule], // gRPC client for stories-service
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}

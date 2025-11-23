import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { ChaptersController } from "./chapters.controller";
import { ChaptersService } from "./chapters.service";

@Module({
  imports: [StoriesClientModule], // gRPC client for stories-service
  controllers: [ChaptersController],
  providers: [ChaptersService]
})
export class ChaptersModule {}

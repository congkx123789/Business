import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { ReadingProgressController } from "./reading-progress.controller";
import { ReadingProgressService } from "./reading-progress.service";

@Module({
  imports: [StoriesClientModule], // gRPC client for stories-service
  controllers: [ReadingProgressController],
  providers: [ReadingProgressService]
})
export class ReadingProgressModule {}

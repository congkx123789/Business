import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { DrmService } from "./drm.service";
import { CopyProtectionService } from "./copy-protection.service";
import { WatermarkingService } from "./watermarking.service";

@Module({
  imports: [DatabaseModule],
  providers: [DrmService, CopyProtectionService, WatermarkingService],
  exports: [DrmService],
})
export class DrmModule {}



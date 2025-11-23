import { Module } from "@nestjs/common";
import { UsersClientModule } from "../../clients/users-client.module";
import { AIClientModule } from "../../clients/ai-client.module";
import { AnnotationsController } from "./annotations.controller";
import { AnnotationsResolver } from "./annotations.resolver";
import { AnnotationsService } from "./annotations.service";

@Module({
  imports: [UsersClientModule, AIClientModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService, AnnotationsResolver],
})
export class AnnotationsModule {}
















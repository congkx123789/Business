import { Module } from "@nestjs/common";
import { SummarizationService } from "./summarization.service";
import { AnnotationSummaryService } from "./annotation-summary.service";

@Module({
  providers: [SummarizationService, AnnotationSummaryService],
  exports: [SummarizationService, AnnotationSummaryService],
})
export class SummarizationModule {}



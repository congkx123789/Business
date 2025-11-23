import { Module } from "@nestjs/common";
import { AnnotationsService } from "./annotations.service";
import { AnnotationUnificationService } from "./annotation-unification.service";
import { AnnotationRevisitationService } from "./annotation-revisitation.service";
import { AnnotationExportService } from "./annotation-export.service";
import { AnnotationAiSummaryService } from "./annotation-ai-summary.service";
import { AnnotationSyncService } from "./annotation-sync.service";

@Module({
  providers: [
    AnnotationsService,
    AnnotationUnificationService,
    AnnotationRevisitationService,
    AnnotationExportService,
    AnnotationAiSummaryService,
    AnnotationSyncService,
  ],
  exports: [
    AnnotationsService,
    AnnotationUnificationService,
    AnnotationRevisitationService,
    AnnotationExportService,
    AnnotationAiSummaryService,
    AnnotationSyncService,
  ],
})
export class AnnotationsModule {}

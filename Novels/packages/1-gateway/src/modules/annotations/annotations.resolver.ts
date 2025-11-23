import {
  Args,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AnnotationsService } from "./annotations.service";

@Resolver("Annotation")
@UseGuards(JwtAuthGuard)
export class AnnotationsResolver {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Query("annotations")
  annotations(
    @CurrentUser() user: any,
    @Args("chapterId") chapterId: string,
  ) {
    return this.annotationsService.getAnnotations(
      String(user?.userId ?? user?.id),
      chapterId,
    );
  }

  @Mutation("createAnnotation")
  createAnnotation(
    @CurrentUser() user: any,
    @Args("input") input: Record<string, any>,
  ) {
    return this.annotationsService.createAnnotation(
      String(user?.userId ?? user?.id),
      input,
    );
  }

  @Mutation("updateAnnotation")
  updateAnnotation(
    @Args("annotationId") annotationId: string,
    @Args("input") input: Record<string, any>,
  ) {
    return this.annotationsService.updateAnnotation(annotationId, input);
  }

  @Mutation("deleteAnnotation")
  deleteAnnotation(@Args("annotationId") annotationId: string) {
    return this.annotationsService.deleteAnnotation(annotationId);
  }

  @Mutation("generateAnnotationSummary")
  generateAnnotationSummary(
    @CurrentUser() user: any,
    @Args("chapterId") chapterId: string,
    @Args("highlightIds", { type: () => [String], nullable: true })
    highlightIds?: string[],
  ) {
    return this.annotationsService.generateSummary(String(user?.userId ?? user?.id), {
      chapterId,
      highlightIds: highlightIds ?? undefined,
    });
  }

  @Mutation("exportAnnotations")
  exportAnnotations(
    @CurrentUser() user: any,
    @Args("format") format: string,
    @Args("destination") destination?: string,
  ) {
    return this.annotationsService.exportAnnotations(
      String(user?.userId ?? user?.id),
      { format, destination },
    );
  }

  @Mutation("unifyAnnotations")
  unifyAnnotations(
    @CurrentUser() user: any,
    @Args("sources") sources: Array<{ type: string; payload: Record<string, any> }>,
  ) {
    return this.annotationsService.unifyAnnotations(
      String(user?.userId ?? user?.id),
      { sources },
    );
  }

  @Query("revisitationQueue")
  revisitationQueue(
    @CurrentUser() user: any,
    @Args("chapterId") chapterId: string,
  ) {
    return this.annotationsService.getRevisitationQueue(
      String(user?.userId ?? user?.id),
      chapterId,
    );
  }
}



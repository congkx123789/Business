import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AnnotationsService } from "./annotations.service";

@Controller("annotations")
@UseGuards(JwtAuthGuard)
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get(":chapterId")
  getAnnotations(@Req() req: any, @Param("chapterId") chapterId: string) {
    return this.annotationsService.getAnnotations(
      String(req.user.userId),
      chapterId,
    );
  }

  @Post()
  createAnnotation(@Req() req: any, @Body() dto: any) {
    return this.annotationsService.createAnnotation(
      String(req.user.userId),
      dto,
    );
  }

  @Put(":id")
  updateAnnotation(@Param("id") id: string, @Body() dto: any) {
    return this.annotationsService.updateAnnotation(id, dto);
  }

  @Delete(":id")
  deleteAnnotation(@Param("id") id: string) {
    return this.annotationsService.deleteAnnotation(id);
  }

  @Post("generate-summary")
  generateSummary(
    @Req() req: any,
    @Body() payload: { chapterId: string; highlightIds?: string[] },
  ) {
    return this.annotationsService.generateSummary(String(req.user.userId), {
      chapterId: payload.chapterId,
      highlightIds: payload.highlightIds,
    });
  }

  @Post("export")
  exportAnnotations(
    @Req() req: any,
    @Body() payload: { format: string; destination?: string },
  ) {
    return this.annotationsService.exportAnnotations(
      String(req.user.userId),
      payload,
    );
  }

  @Post("unify")
  unifyAnnotations(
    @Req() req: any,
    @Body()
    payload: { sources: Array<{ type: string; payload: Record<string, any> }> },
  ) {
    return this.annotationsService.unifyAnnotations(
      String(req.user.userId),
      payload,
    );
  }

  @Get("revisitation-queue/:chapterId")
  getRevisitationQueue(
    @Req() req: any,
    @Param("chapterId") chapterId: string,
  ) {
    return this.annotationsService.getRevisitationQueue(
      String(req.user.userId),
      chapterId,
    );
  }
}



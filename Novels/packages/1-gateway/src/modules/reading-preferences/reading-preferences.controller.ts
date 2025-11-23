import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ReadingPreferencesService } from "./reading-preferences.service";

@Controller("reading-preferences")
@UseGuards(JwtAuthGuard)
export class ReadingPreferencesController {
  constructor(
    private readonly readingPreferencesService: ReadingPreferencesService,
  ) {}

  @Get()
  getReadingPreferences(@Req() req: any) {
    return this.readingPreferencesService.getReadingPreferences(
      Number(req.user.userId),
    );
  }

  @Put()
  updateReadingPreferences(@Req() req: any, @Body() dto: any) {
    return this.readingPreferencesService.updateReadingPreferences(
      Number(req.user.userId),
      dto,
    );
  }
}













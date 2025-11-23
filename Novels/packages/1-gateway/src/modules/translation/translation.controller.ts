import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { TranslationService } from "./translation.service";

@Controller("api/translate")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post("text")
  async translateText(
    @Body() dto: { text: string; fromLang: string; toLang: string; context?: string },
  ) {
    return this.translationService.translateText(dto.text, dto.fromLang, dto.toLang, dto.context);
  }

  @Post("sentence")
  async translateSentence(
    @Body() dto: { sentence: string; fromLang: string; toLang: string; context?: string },
  ) {
    return this.translationService.translateSentence(
      dto.sentence,
      dto.fromLang,
      dto.toLang,
      dto.context,
    );
  }

  @Post("parallel")
  async getParallelTranslation(
    @Body() dto: { text: string; fromLang: string; toLang: string; displayMode?: string },
  ) {
    return this.translationService.getParallelTranslation(
      dto.text,
      dto.fromLang,
      dto.toLang,
      dto.displayMode,
    );
  }
}


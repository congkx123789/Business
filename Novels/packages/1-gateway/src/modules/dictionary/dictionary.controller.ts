import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { DictionaryService } from "./dictionary.service";

@Controller("api/dictionary")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get("lookup")
  async lookupWord(
    @Query("word") word: string,
    @Query("fromLang") fromLang: string,
    @Query("toLang") toLang: string,
    @Query("dictionarySource") dictionarySource?: string,
  ) {
    return this.dictionaryService.lookupWord(word, fromLang, toLang, dictionarySource);
  }

  @Post("touch-translate")
  async touchTranslate(
    @Body()
    dto: {
      word: string;
      fromLang: string;
      toLang: string;
      position?: { x: number; y: number };
    },
  ) {
    return this.dictionaryService.touchTranslate(
      dto.word,
      dto.fromLang,
      dto.toLang,
      dto.position,
    );
  }
}













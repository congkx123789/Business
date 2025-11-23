import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { TranslationService } from "./translation.service";

@Resolver("Translation")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class TranslationResolver {
  constructor(private readonly translationService: TranslationService) {}

  @Mutation("translateText")
  translateText(
    @Args("text") text: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string,
    @Args("context") context?: string,
  ) {
    return this.translationService.translateText(text, fromLang, toLang, context);
  }

  @Mutation("translateSentence")
  translateSentence(
    @Args("sentence") sentence: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string,
    @Args("context") context?: string,
  ) {
    return this.translationService.translateSentence(sentence, fromLang, toLang, context);
  }

  @Query("getParallelTranslation")
  getParallelTranslation(
    @Args("text") text: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string,
    @Args("displayMode") displayMode?: string,
  ) {
    return this.translationService.getParallelTranslation(text, fromLang, toLang, displayMode);
  }
}


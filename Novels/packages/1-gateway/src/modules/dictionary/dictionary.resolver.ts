import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { DictionaryService } from "./dictionary.service";

@Resolver("Dictionary")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class DictionaryResolver {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Query("lookupWord")
  lookupWord(
    @Args("word") word: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string,
    @Args("dictionarySource") dictionarySource?: string,
  ) {
    return this.dictionaryService.lookupWord(word, fromLang, toLang, dictionarySource);
  }

  @Mutation("touchTranslate")
  touchTranslate(
    @Args("word") word: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string,
    @Args("position") position?: { x: number; y: number },
  ) {
    return this.dictionaryService.touchTranslate(word, fromLang, toLang, position);
  }
}


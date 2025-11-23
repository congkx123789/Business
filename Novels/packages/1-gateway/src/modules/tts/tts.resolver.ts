import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { TTSService } from "./tts.service";

@Resolver("TTS")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class TTSResolver {
  constructor(private readonly ttsService: TTSService) {}

  @Mutation("synthesizeSpeech")
  synthesizeSpeech(
    @Args("text") text: string,
    @Args("language") language: string,
    @Args("voice") voice?: string,
    @Args("speed") speed?: number,
    @Args("emotion") emotion?: string,
    @Args("voiceStyle") voiceStyle?: string,
    @Args("context") context?: string,
  ) {
    return this.ttsService.synthesizeSpeech(text, language, voice, speed, emotion, voiceStyle, context);
  }

  @Mutation("synthesizeEmotionalSpeech")
  synthesizeEmotionalSpeech(
    @Args("text") text: string,
    @Args("language") language: string,
    @Args("emotion") emotion: string,
    @Args("voiceStyle") voiceStyle?: string,
    @Args("speed") speed?: number,
  ) {
    return this.ttsService.synthesizeEmotionalSpeech(text, language, emotion, voiceStyle, speed);
  }

  @Query("getTTSWithSync")
  getTTSWithSync(
    @Args("text") text: string,
    @Args("language") language: string,
    @Args("voice") voice?: string,
    @Args("syncMode") syncMode?: string,
  ) {
    return this.ttsService.getTTSWithSync(text, language, voice, syncMode);
  }

  @Query("humanNarration")
  getHumanNarration(@Args("storyId") storyId: string, @Args("chapterId") chapterId: string) {
    return this.ttsService.getHumanNarration(storyId, chapterId);
  }
}


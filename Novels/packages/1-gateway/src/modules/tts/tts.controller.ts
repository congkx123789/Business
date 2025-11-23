import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { TTSService } from "./tts.service";

@Controller("api/tts")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class TTSController {
  constructor(private readonly ttsService: TTSService) {}

  @Post("synthesize")
  async synthesizeSpeech(
    @Body()
    dto: {
      text: string;
      language: string;
      voice?: string;
      speed?: number;
      emotion?: string;
      voiceStyle?: string;
      context?: string;
    },
  ) {
    return this.ttsService.synthesizeSpeech(
      dto.text,
      dto.language,
      dto.voice,
      dto.speed,
      dto.emotion,
      dto.voiceStyle,
      dto.context,
    );
  }

  @Post("synthesize-emotional")
  async synthesizeEmotionalSpeech(
    @Body()
    dto: {
      text: string;
      language: string;
      emotion: string;
      voiceStyle?: string;
      speed?: number;
    },
  ) {
    return this.ttsService.synthesizeEmotionalSpeech(
      dto.text,
      dto.language,
      dto.emotion,
      dto.voiceStyle,
      dto.speed,
    );
  }

  @Post("synthesize-with-sync")
  async synthesizeWithSync(
    @Body()
    dto: {
      text: string;
      language: string;
      voice?: string;
      syncMode?: string;
    },
  ) {
    return this.ttsService.getTTSWithSync(dto.text, dto.language, dto.voice, dto.syncMode);
  }

  @Get("narration/:storyId/:chapterId")
  async getHumanNarration(@Param("storyId") storyId: string, @Param("chapterId") chapterId: string) {
    return this.ttsService.getHumanNarration(storyId, chapterId);
  }
}


import { Injectable, Logger } from "@nestjs/common";

export interface TtsQueueJob {
  storyId: string;
  chapterId: string;
  language: string;
  voice?: string;
}

@Injectable()
export class TtsQueueWorker {
  private readonly logger = new Logger(TtsQueueWorker.name);

  async handle(job: TtsQueueJob) {
    this.logger.debug(`Queued TTS job: story=${job.storyId} chapter=${job.chapterId} lang=${job.language}`);
    // Placeholder for Bull queue processing implementation
  }
}



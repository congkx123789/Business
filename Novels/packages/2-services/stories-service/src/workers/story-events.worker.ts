import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";
import { SearchIntegrationService } from "../modules/search/search.service";

interface StoryEventPayload {
  id: number;
  title: string;
  author?: string;
  description?: string;
}

@Processor("story-events")
export class StoryEventsWorker {
  private readonly logger = new Logger(StoryEventsWorker.name);

  constructor(private readonly searchIntegration: SearchIntegrationService) {}

  @Process(EVENT_BUS_TOPICS.STORY_CREATED)
  async handleStoryCreated(job: Job<StoryEventPayload>) {
    this.logger.log(`Forwarding story.created event: ${JSON.stringify(job.data)}`);
    await this.searchIntegration.indexStory({
      id: job.data.id,
      title: job.data.title,
      author: job.data.author,
      description: job.data.description,
    });
  }

  @Process(EVENT_BUS_TOPICS.STORY_UPDATED)
  async handleStoryUpdated(job: Job<StoryEventPayload>) {
    this.logger.log(`Forwarding story.updated event: ${JSON.stringify(job.data)}`);
    await this.searchIntegration.updateStoryIndex({
      id: job.data.id,
      title: job.data.title,
      author: job.data.author,
      description: job.data.description,
    });
  }
}

@Processor("chapter-events")
export class ChapterEventsWorker {
  private readonly logger = new Logger(ChapterEventsWorker.name);

  constructor(private readonly searchIntegration: SearchIntegrationService) {}

  @Process(EVENT_BUS_TOPICS.CHAPTER_CREATED)
  async handleChapterCreated(job: Job<{ id: number; storyId: number; title: string }>) {
    this.logger.log(`Forwarding chapter.created event: ${JSON.stringify(job.data)}`);
    await this.searchIntegration.updateStoryIndex({
      id: job.data.storyId,
    });
  }

  @Process(EVENT_BUS_TOPICS.CHAPTER_UPDATED)
  async handleChapterUpdated(job: Job<{ id: number; storyId: number; title?: string }>) {
    this.logger.log(`Forwarding chapter.updated event: ${JSON.stringify(job.data)}`);
    await this.searchIntegration.updateStoryIndex({
      id: job.data.storyId,
    });
  }
}



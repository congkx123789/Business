import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bull";
import { STORY_EVENTS } from "7-shared";
import { SearchService } from "../modules/search/search.service";

@Processor("story-events")
@Injectable()
export class StoryIndexerWorker {
  private readonly logger = new Logger(StoryIndexerWorker.name);

  constructor(private readonly searchService: SearchService) {}

  @Process(STORY_EVENTS.STORY_CREATED)
  async handleStoryCreated(job: Job) {
    const story = job.data;
    this.logger.log(`Indexing story #${story.id}`);

    await this.searchService.indexStory({
      id: story.id,
      title: story.title,
      author: story.author,
      description: story.description,
      content: story.content,
      coverImage: story.coverImage,
      genres: story.genres,
    });
  }

  @Process(STORY_EVENTS.STORY_UPDATED)
  async handleStoryUpdated(job: Job) {
    const story = job.data;
    this.logger.log(`Updating story index #${story.id}`);

    await this.searchService.updateStoryIndex({
      id: story.id,
      title: story.title,
      author: story.author,
      description: story.description,
      content: story.content,
      coverImage: story.coverImage,
      genres: story.genres,
    });
  }

  @Process(STORY_EVENTS.STORY_DELETED)
  async handleStoryDeleted(job: Job) {
    const { id } = job.data;
    this.logger.log(`Removing story #${id} from index`);
    await this.searchService.deleteStoryIndex(id);
  }
}



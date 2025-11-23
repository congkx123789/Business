import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bull";
import { SOCIAL_EVENTS } from "7-shared";
import { SearchService } from "../modules/search/search.service";

@Processor("social-events")
@Injectable()
export class PostIndexerWorker {
  private readonly logger = new Logger(PostIndexerWorker.name);

  constructor(private readonly searchService: SearchService) {}

  @Process(SOCIAL_EVENTS.POST_CREATED)
  async handlePostCreated(job: Job) {
    const post = job.data;
    this.logger.log(`Indexing post #${post.id}`);

    await this.searchService.indexPost({
      id: post.id,
      userId: post.userId,
      content: post.content,
      storyId: post.storyId,
      groupId: post.groupId,
      createdAt: post.createdAt,
    });
  }

  @Process(SOCIAL_EVENTS.POST_DELETED)
  async handlePostDeleted(job: Job) {
    const { id } = job.data;
    this.logger.log(`Removing post #${id} from index`);
    await this.searchService.deletePostIndex(id);
  }
}



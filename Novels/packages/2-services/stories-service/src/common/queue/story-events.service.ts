import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

@Injectable()
export class StoryEventsService {
  constructor(
    @InjectQueue("story-events") private readonly storyQueue: Queue,
    @InjectQueue("chapter-events") private readonly chapterQueue: Queue
  ) {}

  async emitStoryCreated(storyData: {
    id: number;
    title: string;
    author?: string;
    description?: string;
  }) {
    await this.storyQueue.add(EVENT_BUS_TOPICS.STORY_CREATED, storyData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitStoryUpdated(storyData: {
    id: number;
    title?: string;
    author?: string;
    description?: string;
  }) {
    await this.storyQueue.add(EVENT_BUS_TOPICS.STORY_UPDATED, storyData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitChapterCreated(chapterData: {
    id: number;
    storyId: number;
    title: string;
    order: number;
  }) {
    await this.chapterQueue.add(
      EVENT_BUS_TOPICS.CHAPTER_CREATED,
      { ...chapterData, bookId: chapterData.storyId },
      {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      }
    );
  }

  async emitChapterUpdated(chapterData: {
    id: number;
    storyId: number;
    title?: string;
  }) {
    await this.chapterQueue.add(
      EVENT_BUS_TOPICS.CHAPTER_UPDATED,
      { ...chapterData, bookId: chapterData.storyId },
      {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      }
    );
  }
}


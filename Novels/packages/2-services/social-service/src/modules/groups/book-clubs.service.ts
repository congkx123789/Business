import { Injectable } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { PrismaService } from "../../prisma/prisma.service";
import { RpcException } from "@nestjs/microservices";

interface CreateBookClubParams {
  ownerId: string;
  name: string;
  description?: string;
  storyId: string;
}

interface ScheduleReadingParams {
  groupId: string;
  storyId: string;
  chapterNumber: number;
  deadline: string;
  discussionDate?: string;
}

@Injectable()
export class BookClubsService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly prisma: PrismaService,
  ) {}

  async createBookClub(params: CreateBookClubParams) {
    return this.groupsService.createGroup({
      ownerId: params.ownerId,
      name: params.name,
      description: params.description,
      type: "book-club",
      storyId: params.storyId,
    });
  }

  async scheduleReading(params: ScheduleReadingParams) {
    const numericGroupId = Number(params.groupId);
    const numericStoryId = Number(params.storyId);
    const group = await this.prisma.group.findUnique({
      where: { id: numericGroupId },
    });

    if (!group || group.type !== "book-club") {
      throw new RpcException("Group is not a book club");
    }

    if (group.storyId !== numericStoryId) {
      throw new RpcException("Story mismatch for book club schedule");
    }

    const schedule = await this.prisma.readingSchedule.create({
      data: {
        groupId: numericGroupId,
        storyId: numericStoryId,
        chapterNumber: params.chapterNumber,
        deadline: new Date(params.deadline),
        discussionDate: params.discussionDate
          ? new Date(params.discussionDate)
          : undefined,
      },
    });

    return {
      id: schedule.id,
      groupId: schedule.groupId,
      storyId: schedule.storyId,
      chapterNumber: schedule.chapterNumber,
      deadline: schedule.deadline.toISOString(),
      discussionDate: schedule.discussionDate
        ? schedule.discussionDate.toISOString()
        : undefined,
    };
  }

  async getSchedule(groupId: string) {
    const numericGroupId = Number(groupId);
    const group = await this.prisma.group.findUnique({
      where: { id: numericGroupId },
    });

    if (!group) {
      throw new RpcException("Group not found");
    }

    const schedule = await this.prisma.readingSchedule.findMany({
      where: { groupId: numericGroupId },
      orderBy: { deadline: "asc" },
    });

    return {
      items: schedule.map((item) => ({
        id: item.id,
        chapterNumber: item.chapterNumber,
        deadline: item.deadline.toISOString(),
        discussionDate: item.discussionDate
          ? item.discussionDate.toISOString()
          : undefined,
      })),
    };
  }
}



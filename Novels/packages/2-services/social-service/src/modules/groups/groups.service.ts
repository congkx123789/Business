import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SocialProducer } from "../../events/social.producer";
import { RpcException } from "@nestjs/microservices";

interface CreateGroupParams {
  ownerId: string;
  name: string;
  description?: string;
  type?: "general" | "book-club";
  storyId?: string;
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialProducer: SocialProducer,
  ) {}

  async createGroup(params: CreateGroupParams) {
    const numericOwnerId = Number(params.ownerId);
    const group = await this.prisma.group.create({
      data: {
        ownerId: numericOwnerId,
        name: params.name,
        description: params.description,
        type: params.type ?? "general",
        storyId: params.storyId ? Number(params.storyId) : undefined,
      },
    });

    await this.prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: numericOwnerId,
        role: "owner",
      },
    });

    await this.socialProducer.emitGroupCreated(group);

    return this.mapGroup(group);
  }

  async joinGroup(groupId: string, userId: string) {
    const numericGroupId = Number(groupId);
    const numericUserId = Number(userId);
    const group = await this.prisma.group.findUnique({ where: { id: numericGroupId } });
    if (!group) {
      throw new RpcException("Group not found");
    }

    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: numericGroupId,
          userId: numericUserId,
        },
      },
    });

    if (existingMember) {
      return { success: false };
    }

    const membership = await this.prisma.groupMember.create({
      data: {
        groupId: numericGroupId,
        userId: numericUserId,
        role: "member",
      },
    });

    await this.prisma.group.update({
      where: { id: numericGroupId },
      data: { memberCount: { increment: 1 } },
    });

    await this.socialProducer.emitGroupMemberJoined(groupId, userId);

    return this.mapMembership(membership);
  }

  async leaveGroup(groupId: string, userId: string) {
    const numericGroupId = Number(groupId);
    const numericUserId = Number(userId);
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: numericGroupId,
          userId: numericUserId,
        },
      },
    });

    if (!membership) {
      throw new RpcException("Membership not found");
    }

    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: numericGroupId,
          userId: numericUserId,
        },
      },
    });

    await this.prisma.group.update({
      where: { id: numericGroupId },
      data: { memberCount: { decrement: 1 } },
    });

    return {};
  }

  async getGroup(groupId: string) {
    const numericGroupId = Number(groupId);
    const group = await this.prisma.group.findUnique({
      where: { id: numericGroupId },
    });

    if (!group) {
      throw new RpcException("Group not found");
    }

    return this.mapGroup(group);
  }

  private mapGroup(group: {
    id: number;
    ownerId: number;
    name: string;
    description: string | null;
    memberCount: number;
    createdAt: Date;
  }) {
    return {
      id: String(group.id),
      ownerId: String(group.ownerId),
      name: group.name,
      description: group.description ?? "",
      memberCount: group.memberCount,
      createdAt: group.createdAt.toISOString(),
    };
  }

  private mapMembership(member: { groupId: number; userId: number; role: string; joinedAt: Date }) {
    return {
      groupId: String(member.groupId),
      userId: String(member.userId),
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    };
  }
}



import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { VipHistoryEntry, VipLevel, VipMemberSnapshot } from "../dto/vip-level.dto";

const DEFAULT_LEVELS: VipLevel[] = [
  { level: 1, name: "Bronze", minSpending: 0, discountPercent: 0, monthlyVotes: 0, benefits: [] },
  { level: 2, name: "Silver", minSpending: 500, discountPercent: 5, monthlyVotes: 10, benefits: ["Profile badge"] },
  { level: 3, name: "Gold", minSpending: 2000, discountPercent: 8, monthlyVotes: 25, benefits: ["Profile badge", "Priority support"] },
  { level: 4, name: "Platinum", minSpending: 5000, discountPercent: 10, monthlyVotes: 40, benefits: ["All lower-tier perks", "Early beta access"] },
];

@Injectable()
export class LoyaltyProgramService {
  private readonly members = new Map<string, VipMemberSnapshot>();
  private readonly history = new Map<string, VipHistoryEntry[]>();

  recordSpending(userId: string, amount: number) {
    const member = this.ensureMember(userId);
    member.totalSpending += amount;
    member.lastUpdatedAt = new Date().toISOString();
    const previousLevel = member.currentLevel;
    member.currentLevel = this.calculateLevel(member.totalSpending);

    if (member.currentLevel.level !== previousLevel.level) {
      this.pushHistoryEntry(member);
    }

    return member;
  }

  getVipLevel(userId: string) {
    return this.ensureMember(userId);
  }

  getVipBenefits(userId: string) {
    const member = this.ensureMember(userId);
    return member.currentLevel;
  }

  listVipLevels() {
    return DEFAULT_LEVELS;
  }

  getVipHistory(userId: string, page = 1, limit = 20) {
    const entries = this.history.get(userId) ?? [];
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: entries.slice(start, end),
      total: entries.length,
      page,
      limit,
    };
  }

  private ensureMember(userId: string): VipMemberSnapshot {
    if (!this.members.has(userId)) {
      this.members.set(userId, {
        userId,
        currentLevel: DEFAULT_LEVELS[0],
        totalSpending: 0,
        lastUpdatedAt: new Date().toISOString(),
      });
      this.history.set(userId, []);
    }
    return this.members.get(userId)!;
  }

  private calculateLevel(totalSpending: number): VipLevel {
    let current = DEFAULT_LEVELS[0];
    for (const level of DEFAULT_LEVELS) {
      if (totalSpending >= level.minSpending) {
        current = level;
      }
    }
    return current;
  }

  private pushHistoryEntry(member: VipMemberSnapshot) {
    const entry: VipHistoryEntry = {
      id: randomUUID(),
      userId: member.userId,
      level: member.currentLevel.level,
      levelName: member.currentLevel.name,
      totalSpending: member.totalSpending,
      achievedAt: new Date().toISOString(),
    };
    const entries = this.history.get(member.userId);
    if (!entries) {
      this.history.set(member.userId, [entry]);
      return;
    }
    entries.unshift(entry);
  }
}

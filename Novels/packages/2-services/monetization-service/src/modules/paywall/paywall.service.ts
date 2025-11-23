import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { CheckAccessDto } from "./dto/check-access.dto";
import { AccessControlService } from "./access-control.service";
import { PaywallConfigDto } from "./dto/paywall-config.dto";

@Injectable()
export class PaywallService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly accessControlService: AccessControlService
  ) {}

  async checkChapterAccess(data: CheckAccessDto) {
    return this.accessControlService.resolveAccess(data);
  }

  async grantAccess(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    reason: "purchased" | "subscription" | "privilege";
    expiresAt?: string | null;
  }) {
    return this.accessControlService.grantAccess(data);
  }

  async getPaywallConfig(storyId: string): Promise<PaywallConfigDto> {
    return this.accessControlService.getPaywallConfig(storyId);
  }

  async updatePaywallConfig(config: {
    storyId: string;
    freeChapters: number;
    enabled: boolean;
    previewLength?: number;
  }) {
    return this.accessControlService.updatePaywallConfig({
      storyId: config.storyId,
      freeChapters: config.freeChapters,
      enabled: config.enabled,
      previewLength: config.previewLength ?? 500,
    });
  }
}


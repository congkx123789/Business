import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { DiscoveryService } from "./discovery.service";

@Controller("authors")
@UseGuards(JwtAuthGuard)
export class AuthorEcosystemController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get(":authorId/dashboard")
  getDashboard(@Param("authorId") authorId: string) {
    return this.discoveryService.getAuthorDashboard(authorId);
  }

  @Get(":authorId/analytics")
  getAnalytics(@Param("authorId") authorId: string) {
    return this.discoveryService.getAuthorAnalytics(authorId);
  }

  @Get(":authorId/revenue")
  getRevenue(@Param("authorId") authorId: string) {
    return this.discoveryService.getAuthorRevenue(authorId);
  }

  @Get(":authorId/engagement")
  getEngagement(@Param("authorId") authorId: string) {
    return this.discoveryService.getAuthorEngagement(authorId);
  }

  @Get(":authorId/reader-insights")
  getReaderInsights(@Param("authorId") authorId: string) {
    return this.discoveryService.getReaderInsights(authorId);
  }
}



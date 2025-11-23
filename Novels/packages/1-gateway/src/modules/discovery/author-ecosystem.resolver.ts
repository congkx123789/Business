import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { DiscoveryService } from "./discovery.service";

@Resolver("AuthorEcosystem")
@UseGuards(JwtAuthGuard)
export class AuthorEcosystemResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query("authorDashboard")
  authorDashboard(@Args("authorId") authorId: string) {
    return this.discoveryService.getAuthorDashboard(authorId);
  }

  @Query("authorAnalytics")
  authorAnalytics(@Args("authorId") authorId: string) {
    return this.discoveryService.getAuthorAnalytics(authorId);
  }

  @Query("authorRevenue")
  authorRevenue(@Args("authorId") authorId: string) {
    return this.discoveryService.getAuthorRevenue(authorId);
  }

  @Query("authorEngagement")
  authorEngagement(@Args("authorId") authorId: string) {
    return this.discoveryService.getAuthorEngagement(authorId);
  }

  @Query("readerInsights")
  readerInsights(@Args("authorId") authorId: string) {
    return this.discoveryService.getReaderInsights(authorId);
  }
}



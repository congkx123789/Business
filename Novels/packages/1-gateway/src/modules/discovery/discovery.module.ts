import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { SearchClientModule } from "../../clients/search-client.module";
import { DiscoveryController } from "./discovery.controller";
import { VotingController } from "./voting.controller";
import { AuthorEcosystemController } from "./author-ecosystem.controller";
import { DiscoveryService } from "./discovery.service";
import { DiscoveryResolver } from "./discovery.resolver";
import { VotingResolver } from "./voting.resolver";
import { AuthorEcosystemResolver } from "./author-ecosystem.resolver";

@Module({
  imports: [StoriesClientModule, SearchClientModule],
  controllers: [DiscoveryController, VotingController, AuthorEcosystemController],
  providers: [
    DiscoveryService,
    DiscoveryResolver,
    VotingResolver,
    AuthorEcosystemResolver,
  ],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}


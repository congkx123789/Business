import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { StoriesResolver } from "./stories.resolver";
import { SocialClientModule } from "../../clients/social-client.module";
import { SocialResolver } from "./social.resolver";
import { SocialService } from "../social/social.service";

@Module({
  imports: [StoriesClientModule, SocialClientModule],
  providers: [StoriesResolver, SocialResolver, SocialService],
  exports: [SocialService],
})
export class GraphQLModule {}

import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ReadingPreferencesService } from "./reading-preferences.service";

@Resolver("ReadingPreferences")
@UseGuards(JwtAuthGuard)
export class ReadingPreferencesResolver {
  constructor(
    private readonly readingPreferencesService: ReadingPreferencesService,
  ) {}

  @Query("readingPreferences")
  readingPreferences(@CurrentUser() user: any) {
    return this.readingPreferencesService.getReadingPreferences(
      Number(user?.userId ?? user?.id),
    );
  }

  @Mutation("updateReadingPreferences")
  updateReadingPreferences(
    @CurrentUser() user: any,
    @Args("input") input: Record<string, any>,
  ) {
    return this.readingPreferencesService.updateReadingPreferences(
      Number(user?.userId ?? user?.id),
      input,
    );
  }
}



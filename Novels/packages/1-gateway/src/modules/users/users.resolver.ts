import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";

@Resolver("User")
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query("user")
  user(@Args("id") id: number) {
    return this.usersService.getUserById(Number(id));
  }

  @Query("me")
  me(@CurrentUser() user: any) {
    return this.usersService.getProfile(Number(user?.userId ?? user?.id));
  }

  @Mutation("updateProfile")
  updateProfile(
    @CurrentUser() user: any,
    @Args("email") email?: string,
    @Args("username") username?: string,
  ) {
    return this.usersService.updateProfile(Number(user?.userId ?? user?.id), {
      email,
      username,
    });
  }
}



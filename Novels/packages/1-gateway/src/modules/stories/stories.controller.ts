import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

/**
 * Stories REST Controller
 * REST API endpoints for web frontend (3-web)
 * 
 * Routes:
 * - GET /api/stories - Get all stories
 * - GET /api/stories/:id - Get story by ID
 */
@Controller("stories")
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  async getStories(@CurrentUser() user: any) {
    // Call gRPC client, NO business logic (Rule #4)
    return this.storiesService.getStories(user.userId);
  }

  @Get(":id")
  async getStory(@Param("id") id: string, @CurrentUser() user: any) {
    // Call gRPC client, NO business logic (Rule #4)
    return this.storiesService.getStory(id, user.userId);
  }
}


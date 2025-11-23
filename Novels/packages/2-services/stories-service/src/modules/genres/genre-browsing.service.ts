import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { StoriesService } from "../stories/stories.service";

@Injectable()
export class GenreBrowsingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storiesService: StoriesService
  ) {}

  async getGenreLandingPage(genreId: number) {
    const result = (await this.databaseService.createData<any[]>(11, "spGenres_GetLandingPage", [
      ["GenreId", genreId],
    ])) as any[];
    const genre = result?.[0];

    const stories = await this.storiesService.getStoriesByGenre(genreId, 1, 20);

    return {
      success: true,
      data: {
        genre: genre ?? null,
        stories: stories.data ?? [],
      },
    };
  }

  getStoriesByGenre(genreId: number, page = 1, limit = 10) {
    return this.storiesService.getStoriesByGenre(genreId, page, limit);
  }
}



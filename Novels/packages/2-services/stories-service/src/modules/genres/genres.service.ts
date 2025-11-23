import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class GenresService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getGenres() {
    try {
      const genres = await this.databaseService.createData<any[]>(11, "spGenres_List", []);
      return {
        success: true,
        data: genres ?? [],
        message: "Genres retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to get genres",
      };
    }
  }
}



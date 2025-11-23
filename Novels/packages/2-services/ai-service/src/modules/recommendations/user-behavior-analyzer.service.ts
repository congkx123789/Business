import { Injectable } from "@nestjs/common";

export interface UserBehaviorSnapshot {
  preferredGenres: string[];
  averageSessionMinutes: number;
  lastActiveAt: Date;
}

@Injectable()
export class UserBehaviorAnalyzerService {
  async getSnapshot(userId: number): Promise<UserBehaviorSnapshot> {
    // Placeholder analytics
    return {
      preferredGenres: userId % 2 === 0 ? ["Cultivation", "Adventure"] : ["Urban", "Romance"],
      averageSessionMinutes: 25,
      lastActiveAt: new Date(),
    };
  }
}



import { Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { RankingService } from "../modules/discovery/ranking.service";

@Processor("ranking-calculation")
export class RankingCalculationWorker {
  private readonly logger = new Logger(RankingCalculationWorker.name);

  constructor(private readonly rankingService: RankingService) {}

  @Process("recalculate")
  async recalculate(job: Job<{ rankingType: string; genreId?: number; timeRange?: string }>) {
    const payload = job.data;
    this.logger.log(`Recalculating rankings for ${payload.rankingType}`);
    await this.rankingService.getRankings({
      rankingType: (payload.rankingType as any) || "monthly-votes",
      genreId: payload.genreId,
      timeRange: (payload.timeRange as any) ?? "monthly",
      limit: 50,
    });
  }
}



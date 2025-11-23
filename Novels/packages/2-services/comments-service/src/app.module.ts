import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, databaseConfig } from "./config/configuration";
import { PrismaModule } from "./database/prisma.module";
import { QueueModule } from "./common/queue/queue.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { ForumsModule } from "./modules/forums/forums.module";
import { PollsModule } from "./modules/polls/polls.module";
import { QuizzesModule } from "./modules/quizzes/quizzes.module";
import { RatingsModule } from "./modules/ratings/ratings.module";
import { CommentsController } from "./controllers/comments.controller";
import { CommentEventsWorker } from "./workers/comment-events.worker";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    QueueModule,
    CommentsModule,
    ReviewsModule,
    ForumsModule,
    PollsModule,
    QuizzesModule,
    RatingsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentEventsWorker],
})
export class AppModule {}


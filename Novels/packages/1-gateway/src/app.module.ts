import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, cacheConfig, jwtConfig } from "./config/app.config";
// Gateway should NOT connect to database (Rule #4)
// Removed: databaseConfig, DatabaseModule
import { ThrottlerModule } from "./common/throttler/throttler.module";
import { GraphQLModule as GraphQLCoreModule } from "./common/graphql/graphql.module";
import { CacheModule } from "./common/cache/cache.module";
import { TraceIdMiddleware } from "./common/middleware/trace-id.middleware";
import { UsersClientModule } from "./clients/users-client.module";
import { StoriesClientModule } from "./clients/stories-client.module";
import { CommentsClientModule } from "./clients/comments-client.module";
import { SocialClientModule } from "./clients/social-client.module";
import { AIClientModule } from "./clients/ai-client.module";
import { SearchClientModule } from "./clients/search-client.module";
import { NotificationClientModule } from "./clients/notification-client.module";
import { WebSocketClientModule } from "./clients/websocket-client.module";
import { CommunityClientModule } from "./clients/community-client.module";
import { MonetizationClientModule } from "./clients/monetization-client.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { StoriesModule } from "./modules/stories/stories.module";
import { BooksModule } from "./modules/books/books.module";
import { ChaptersModule } from "./modules/chapters/chapters.module";
import { ReadingProgressModule } from "./modules/reading-progress/reading-progress.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { BookmarksModule } from "./modules/bookmarks/bookmarks.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { LibraryModule } from "./modules/library/library.module";
import { SocialModule } from "./modules/rest/social.module";
import { GraphQLModule as GraphQLFeatureModule } from "./modules/graphql/graphql.module";
import { HealthModule } from "./modules/health/health.module";
import { ReadingPreferencesModule } from "./modules/reading-preferences/reading-preferences.module";
import { AnnotationsModule } from "./modules/annotations/annotations.module";
import { TTSModule } from "./modules/tts/tts.module";
import { TranslationModule } from "./modules/translation/translation.module";
import { DictionaryModule } from "./modules/dictionary/dictionary.module";
import { CommunityModule } from "./modules/community/community.module";
import { MonetizationModule } from "./modules/monetization/monetization.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, cacheConfig, jwtConfig], // Removed databaseConfig
    }),
    // Rate Limiting (Rule #4)
    ThrottlerModule,
    // Gateway Cache (Rule #4 - Client-specific Optimizations)
    CacheModule,
    // GraphQL BFF for Mobile (Rule #4)
    GraphQLCoreModule,
    // gRPC Clients for microservices
    UsersClientModule,
    StoriesClientModule,
    CommentsClientModule,
    SocialClientModule,
    AIClientModule,
    SearchClientModule,
    NotificationClientModule,
    WebSocketClientModule,
    CommunityClientModule,
    MonetizationClientModule,
    // Gateway modules (routing only, no business logic)
    AuthModule,
    StoriesModule,
    UsersModule,
    BooksModule,
    ChaptersModule,
    ReadingProgressModule,
    CategoriesModule,
    LibraryModule,
    BookmarksModule,
    ReviewsModule,
    // Reading Preferences, Annotations, TTS & Language Tools (NEW)
    ReadingPreferencesModule,
    AnnotationsModule,
    TTSModule,
    TranslationModule,
    DictionaryModule,
    CommunityModule,
    MonetizationModule,
    DiscoveryModule,
    RecommendationsModule,
    // GraphQL BFF for Mobile (Rule #4)
    GraphQLFeatureModule,
    // Health check endpoint
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply trace ID middleware to all routes (Rule #10 - Observability)
    consumer.apply(TraceIdMiddleware).forRoutes("*");
  }
}

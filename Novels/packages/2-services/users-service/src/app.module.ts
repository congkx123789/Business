import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, databaseConfig, jwtConfig } from "./config/configuration";
import { DatabaseModule } from "./common/database/database.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    UsersModule,
  ],
})
export class AppModule {}


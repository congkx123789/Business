import { Module } from "@nestjs/common";
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Request } from "express";

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        sortSchema: true,
        playground: configService.get<string>("NODE_ENV") !== "production",
        introspection: configService.get<string>("NODE_ENV") !== "production",
        context: ({ req }: { req: Request }) => ({ req }),
      }),
    }),
  ],
})
export class GraphQLModule {}


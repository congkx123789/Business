import { Module } from "@nestjs/common";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";

@Module({
  imports: [StoriesClientModule], // gRPC client for stories-service
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService]
})
export class BooksModule {}

import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "../../common/interceptors/cache.interceptor";
import { ChaptersService } from "./chapters.service";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ParseIntPipe } from "../../common/pipes/parse-int.pipe";

@Controller("chapters")
@UseInterceptors(CacheInterceptor) // Gateway cache (Rule #4)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get("book/:bookId")
  findAll(@Param("bookId", ParseIntPipe) bookId: number, @Query() query: PaginationQueryDto) {
    return this.chaptersService.findAll(bookId, query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.chaptersService.findOne(id);
  }
}

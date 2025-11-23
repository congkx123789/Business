import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "../../common/interceptors/cache.interceptor";
import { BooksService } from "./books.service";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { ParseIntPipe } from "../../common/pipes/parse-int.pipe";

@Controller("books")
@UseInterceptors(CacheInterceptor) // Gateway cache (Rule #4)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.booksService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }
}

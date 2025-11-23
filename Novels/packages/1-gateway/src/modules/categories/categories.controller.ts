import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "../../common/interceptors/cache.interceptor";
import { CategoriesService } from "./categories.service";

@Controller("categories")
@UseInterceptors(CacheInterceptor) // Gateway cache (Rule #4)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}

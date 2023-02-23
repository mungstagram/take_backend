import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { SearchesService } from './searches.service';

@Controller('searches')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @ApiOperation({ summary: '유저 검색 api' })
  @ApiQuery({ name: 'category', type: 'string', required: true })
  @ApiQuery({ name: 'search', type: 'string', required: true })
  @Get()
  @HttpCode(200)
  async search(@Query() query: { category: string; search: string }) {
    return this.searchesService.search(query);
  }
}

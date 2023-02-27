import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from './../auth/jwt/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { SearchesService } from './searches.service';

@Controller('searches')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @ApiOperation({ summary: '유저 검색 api' })
  @ApiBadRequestResponse({
    description: '카테고리 혹은 검색 내용을 보내지 않았을 경우',
  })
  @ApiQuery({
    name: 'category',
    type: 'string',
    required: true,
    example: 'users, image, video',
  })
  @ApiQuery({ name: 'search', type: 'string', required: true })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(200)
  @ApiOkResponse({ description: '검색에 성공했을 경우' })
  async search(
    @Query() query: { category: string; search: string },
    @GetPayload() payload: JwtPayload,
  ) {
    const userId = payload.sub;
    return this.searchesService.search(query, userId);
  }
}

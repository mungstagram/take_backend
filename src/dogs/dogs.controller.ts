import { DogCreateRequestDto } from './dtos/dog.request.dto';
import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { DogsService } from './dogs.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dogs')
@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @ApiOperation({ summary: '강아지 프로필 조회 API' })
  @ApiOkResponse({ description: '정상적으로 반환됨' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  async getDog(@GetPayload() payload: JwtPayload) {
    const userId = payload.sub;
    return await this.dogsService.getDog(userId);
  }

  @ApiOperation({ summary: '강아지 프로필 작성 API' })
  @ApiCreatedResponse({ description: '정상적으로 작성됨' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createDog(
    @GetPayload() payload: JwtPayload,
    @Body() dogCreateRequestDto: DogCreateRequestDto,
  ) {
    dogCreateRequestDto.UserId = payload.sub;
    return await this.dogsService.createDog(dogCreateRequestDto);
  }

  @ApiOperation({ summary: '강아지 프로필 수정 API' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateDog(@GetPayload() payload: JwtPayload) {}

  @ApiOperation({ summary: '강아지 프로필 삭제 API' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteDog(@GetPayload() payload: JwtPayload) {}
}

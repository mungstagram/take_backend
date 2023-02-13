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

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDog(@GetPayload() payload: JwtPayload) {
    const userId = payload.sub;
    return await this.dogsService.getDog(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createDog(
    @GetPayload() payload: JwtPayload,
    @Body() dogCreateRequestDto: DogCreateRequestDto,
  ) {
    dogCreateRequestDto.UserId = payload.sub;
    return await this.dogsService.createDog(dogCreateRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateDog(@GetPayload() payload: JwtPayload) {}

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteDog(@GetPayload() payload: JwtPayload) {}
}

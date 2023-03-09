import { Delete, UploadedFiles } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import {
  DogCreateRequestDto,
  DogDeleteReqeustDto,
} from './dtos/dog.request.dto';
import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { DogsService } from './dogs.service';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dogs')
@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @ApiOperation({ summary: '강아지 프로필 작성 API' })
  @ApiCreatedResponse({ description: '정상적으로 작성됨' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          description: '강아지 이름',
          example: '망고',
          type: 'string',
        },
        introduce: {
          description: '강아지 소개',
          example: '무는 강아지',
          type: 'string',
        },
        species: {
          description: '견종',
          example: '스피츠',
          type: 'string',
        },
        weight: {
          description: '강아지 몸무게',
          example: '8.5',
          type: 'number',
        },
        birthday: {
          description: '강아지 태어난 날',
          example: '2022-02-18',
          type: 'date',
        },
        bringDate: {
          description: '강아지 데리고 온 날',
          example: '2022-04-18',
          type: 'date',
        },
        files: {
          description: '이미지 업로드',
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files', 1))
  @HttpCode(201)
  async createDog(
    @GetPayload() payload: JwtPayload,
    @Body() dogCreateRequestDto: DogCreateRequestDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    dogCreateRequestDto.UserId = payload.sub;
    return await this.dogsService.createDog(dogCreateRequestDto, files);
  }

  @ApiOperation({ summary: '강아지 프로필 삭제 API' })
  @ApiNoContentResponse({ description: '정상적으로 작성됨' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete()
  async deleteDog(
    @GetPayload() payload: JwtPayload,
    @Body() dogDeleteReqeustDto: DogDeleteReqeustDto,
  ) {
    dogDeleteReqeustDto.UserId = payload.sub;
    return await this.dogsService.deleteDog(dogDeleteReqeustDto);
  }
}

import { GetPayload } from './../../common/dacorators/get.payload.decorator';
import { JwtPayload } from './../../auth/jwt/jwt.payload.dto';
import { PostsService } from './../services/posts.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PostsCreateRequestsDto } from '../dto/postscreate.request.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  //의존성 주입
  constructor(private readonly postsService: PostsService) {}

  //게시글 작성 api
  @ApiOperation({ summary: '게시물 작성 api' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          description: '제목',
          example: '게시글 제목입니다',
          type: 'string',
        },
        content: {
          description: '내용',
          example: '게시글 내용입니다',
          type: 'string',
        },
        category: {
          description: '카테고리: image or video',
          example: 'image or video',
          type: 'string',
        },
        files: {
          description: '파일 업로드',
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  @HttpCode(201)
  async createPosts(
    @GetPayload() payload: JwtPayload,
    @Body() data: PostsCreateRequestsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.postsService.createPosts(data, files, payload);
  }

  //게시글 조회 user detail
  @ApiOperation({ summary: '게시물 조회 api' })
  @ApiBearerAuth('Authorization')
  @ApiQuery({ name: 'category', type: 'string', required: true })
  @ApiQuery({ name: 'order', type: 'string', required: true })
  @ApiQuery({ name: 'nickname', type: 'string', required: false })
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(200)
  async getAllPosts(
    @Query() query: { category: string; order: string; nickname?: string },
    @GetPayload() payload: JwtPayload,
  ) {
    return await this.postsService.getAllPosts(payload, query);
  }

  //게시글 상세조회 api
  @ApiOperation({ summary: '게시물 상세 조회 api' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get(':postId')
  @HttpCode(200)
  async getOnePost(
    @Param('postId') postId: number,
    @GetPayload() payload: JwtPayload,
  ) {
    return await this.postsService.getOnePost(postId, payload);
  }

  //게시글 수정 api
  @ApiOperation({ summary: '게시물 수정 api' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @HttpCode(201)
  @Put(':postId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  async updatePost(
    @Body() data: PostsCreateRequestsDto,
    @Param('postId') postId: number,
    @GetPayload() payload: JwtPayload,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.postsService.updatePost(postId, data, payload, files);
  }

  //게시글 삭제 api
  @ApiOperation({ summary: '게시물 삭제 api' })
  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @HttpCode(204)
  async deletePost(
    @Param('postId') postId: number,
    @GetPayload() payload: JwtPayload,
  ) {
    return await this.postsService.deletePost(postId, payload);
  }

  //게시글 좋아요 api
  @ApiOperation({ summary: '게시물 좋아요 api' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Put('/likes/:postId')
  async postLikes(
    @Param('postId') postId: number,
    @GetPayload() payload: JwtPayload,
  ) {
    return await this.postsService.postLikes(postId, payload);
  }
}

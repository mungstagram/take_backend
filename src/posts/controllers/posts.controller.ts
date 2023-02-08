import { PostsService } from './../services/posts.service';
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PostsCreateRequestsDto } from '../dto/postscreate.request.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';

@Controller('posts')
export class PostsController {
  //의존성 주입
  constructor(private readonly postsService: PostsService) {}

  //게시글 작성 api
  @ApiOperation({ summary: '게시글 작성 api' })
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async createPosts(
    @Body() data: PostsCreateRequestsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.postsService.createPosts(data, 'project', files);
  }

  //게시글 전체 조회 api
  @ApiOperation({ summary: '게시글 조회 api' })
  @Get()
  async getAllPosts(@Body() body: string) {
    return await this.postsService.getAllPosts(body);
  }
}

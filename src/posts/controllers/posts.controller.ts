import { PostsService } from './../services/posts.service';
import {
  Bind,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PostsCreateRequestsDto } from '../dto/postscreate.request.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '게시글 작성 api' })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createPosts(
    @Body() data: PostsCreateRequestsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);
    return await this.postsService.createPosts(data, 'project', file);
  }

  // @ApiOperation({ summary: '이미지 업로드 api' })
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('image'))
  // async uploadImg(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   return this.postsService.uploadImg('project', file);
  // }

  // @ApiOperation({ summary: '전체게시글 조회 api' })
  // @Get()
  // async getAllPosts() {
  //   return await this.postsService.getAllPosts();
  // }
}

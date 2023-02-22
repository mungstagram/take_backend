import { FileUrlService } from './../helper/get.file.url.helper';
import { UploadFiles, UploadFilesSchema } from './../models/UploadFiles';
import { MongooseModule } from '@nestjs/mongoose';
import { AWSService } from './../helper/fileupload.helper';
import { PostLikes } from './../entities/PostLikes';
import { Posts } from './../entities/Posts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { Comments } from 'src/entities/Comments';
import { CommentLikes } from 'src/entities/CommentsLikes';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Posts, PostLikes, Comments, CommentLikes]),
    AuthModule,
    MongooseModule.forFeature([
      { name: UploadFiles.name, schema: UploadFilesSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, AWSService, FileUrlService],
  exports: [PostsService],
})
export class PostsModule {}

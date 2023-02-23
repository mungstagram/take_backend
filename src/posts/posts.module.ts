import { PostFiles } from './../entities/PostFiles';
import { MongooseModule } from '@nestjs/mongoose';
import { AWSService } from './../helper/fileupload.helper';
import { PostLikes } from './../entities/PostLikes';
import { Posts } from './../entities/Posts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { Comments } from '../entities/Comments';
import { CommentLikes } from '../entities/CommentsLikes';
import { Files } from '../entities/Files';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Posts,
      PostLikes,
      Comments,
      CommentLikes,
      Files,
      PostFiles,
    ]),
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, AWSService],
  exports: [PostsService],
})
export class PostsModule {}

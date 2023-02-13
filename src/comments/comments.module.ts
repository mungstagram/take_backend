import { CommentsController } from './comments.controller';
import { Users } from './../entities/Users';
import { UsersModule } from './../users/users.module';
import { AuthModule } from './../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comments } from '../entities/Comments';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comments, Users]),
    AuthModule,
    UsersModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}

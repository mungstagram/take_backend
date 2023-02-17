import { Dogs } from './../entities/Dogs';
import { Users } from './../entities/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TestingModule } from '@nestjs/testing';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Dogs])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

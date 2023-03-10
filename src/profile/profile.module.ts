import { Files } from '../entities/Files';
import { AWSService } from './../helper/fileupload.helper';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from './../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dogs } from '../entities/Dogs';
import { Users } from '../entities/Users';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import postgresDataSource from 'dataSource';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Users, Dogs, Files], postgresDataSource),
    AuthModule,
    UsersModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, AWSService],
  exports: [ProfileService],
})
export class ProfileModule {}

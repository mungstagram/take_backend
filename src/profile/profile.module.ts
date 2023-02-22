import { FileUrlService } from './../helper/get.file.url.helper';
import { AWSService } from './../helper/fileupload.helper';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from './../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dogs } from './../entities/Dogs';
import { Users } from './../entities/Users';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UploadFiles, UploadFilesSchema } from './../models/UploadFiles';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Users, Dogs]),
    AuthModule,
    MongooseModule.forFeature([
      { name: UploadFiles.name, schema: UploadFilesSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, AWSService, FileUrlService],
  exports: [ProfileService],
})
export class ProfileModule {}

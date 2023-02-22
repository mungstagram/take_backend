import { FileUrlService } from './../helper/get.file.url.helper';
import { AWSService } from './../helper/fileupload.helper';
import { UploadFiles, UploadFilesSchema } from './../models/UploadFiles';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Dogs } from './../entities/Dogs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Dogs]),
    AuthModule,
    MongooseModule.forFeature([
      { name: UploadFiles.name, schema: UploadFilesSchema },
    ]),
  ],
  controllers: [DogsController],
  providers: [DogsService, AWSService, FileUrlService],
  exports: [DogsService],
})
export class DogsModule {}

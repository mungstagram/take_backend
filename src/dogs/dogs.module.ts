import { Files } from '../entities/Files';
import { AWSService } from './../helper/fileupload.helper';
import { AuthModule } from './../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Dogs } from '../entities/Dogs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';
import postgresDataSource from 'dataSource';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Dogs, Files], postgresDataSource),
    AuthModule,
  ],
  controllers: [DogsController],
  providers: [DogsService, AWSService],
  exports: [DogsService],
})
export class DogsModule {}

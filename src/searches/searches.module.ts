import { AuthModule } from './../auth/auth.module';
import { Posts } from './../entities/Posts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Module } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { SearchesController } from './searches.controller';
import postgresDataSource from 'dataSource';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Posts], postgresDataSource),
    AuthModule,
  ],
  controllers: [SearchesController],
  providers: [SearchesService],
})
export class SearchesModule {}

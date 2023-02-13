import { Dogs } from './../entities/Dogs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dogs])],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}

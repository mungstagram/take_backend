import { Users } from './../entities/Users';
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
  ],
  controllers: [DogsController],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {}

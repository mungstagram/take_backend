import { Users } from '../entities/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chattings } from '../entities/mongo/Chattings';
import { ChatRooms } from '../entities/mongo/ChatRoom';
import { Module } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';
import postgresDataSource from 'dataSource';
import mongoDataSource from 'mongoDataSource';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chattings, ChatRooms], mongoDataSource),
    TypeOrmModule.forFeature([Users], postgresDataSource),
  ],
  controllers: [DmsController],
  providers: [DmsService],
})
export class DmsModule {}

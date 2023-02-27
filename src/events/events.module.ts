import { DmsModule } from './../dms/dms.module';
import { Users } from '../entities/Users';
import { Chattings } from '../entities/mongo/Chattings';
import { ChatRooms } from '../entities/mongo/ChatRoom';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DMGateway, ChatRoomsGateway, TestGateWay } from './events.gateway';
import postgresDataSource from 'dataSource';
import mongoDataSource from 'mongoDataSource';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRooms, Chattings], mongoDataSource),
    TypeOrmModule.forFeature([Users], postgresDataSource),
    DmsModule,
  ],
  providers: [DMGateway, ChatRoomsGateway, TestGateWay],
})
export class EventsModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRooms, ChatRoomsSchema } from './../models/ChatRoom';
import { Chattings, ChattingsSchema } from './../models/Chattings';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { Users } from '../entities/Users';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chattings.name, schema: ChattingsSchema },
      { name: ChatRooms.name, schema: ChatRoomsSchema },
    ]),
    TypeOrmModule.forFeature([Users]),
  ],
  providers: [EventsGateway],
})
export class EventsModule {}

import { Users } from './../entities/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chattings, ChattingsSchema } from './../models/Chattings';
import { ChatRooms, ChatRoomsSchema } from './../models/ChatRoom';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRooms.name, schema: ChatRoomsSchema },
      { name: Chattings.name, schema: ChattingsSchema },
    ]),
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [DmsController],
  providers: [DmsService],
})
export class DmsModule {}

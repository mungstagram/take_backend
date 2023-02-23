import { timeGap } from '../helper/timegap.helper';
import { ChatRooms } from './../models/ChatRoom';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { PopupChatRoomDto } from './dto/popup.chatroom.dto';
import { UpdateDmDto } from './dto/update-dm.dto';
import { Model } from 'mongoose';
import { Chattings } from '../models/Chattings';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';

@Injectable()
export class DmsService {
  constructor(
    @InjectModel(ChatRooms.name)
    private readonly chatRoomsModel: Model<ChatRooms>,
    @InjectModel(Chattings.name)
    private readonly chattingsModel: Model<Chattings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async popupChatRoom(popupChatRoomDto: PopupChatRoomDto) {
    const users =
      popupChatRoomDto.senderId < popupChatRoomDto.receiverId
        ? [popupChatRoomDto.senderId, popupChatRoomDto.receiverId]
        : [popupChatRoomDto.receiverId, popupChatRoomDto.senderId];

    const chatRoomsExist = await this.chatRoomsModel.findOne({ users });

    if (!chatRoomsExist) {
      const createdChatRooms = await this.chatRoomsModel.create({ users });
      return createdChatRooms;
    }
    return chatRoomsExist;
  }

  findAll() {
    return `This action returns all dms`;
  }

  async joinChatRoom(chatRoomId: string) {
    const messages = await this.chattingsModel.find({ RoomId: chatRoomId });
    const chatRoom = await this.chatRoomsModel.findOne({ id: chatRoomId });

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname'])
      .where('id = :user0', { user0: chatRoom.users[0] })
      .orWhere('id = :user1', { user1: chatRoom.users[1] })
      .getMany();

    messages.sort((a, b) => {
      if (
        typeof a['createdAt'].getTime() === 'number' &&
        typeof b['createdAt'].getTime() === 'number'
      ) {
        return b['createdAt'].getTime() - a['createdAt'].getTime();
      }
    });

    const returnedMessages = messages.map((v) => {
      return {
        message: v.message,
        sender:
          v.SenderId === users[0]['id']
            ? { id: users[0]['id'], nickname: users[0]['nickname'] }
            : { id: users[1]['id'], nickname: users[1]['nickname'] },
        receiver:
          v.ReceiverId === users[0]['id']
            ? { id: users[0]['id'], nickname: users[0]['nickname'] }
            : { id: users[1]['id'], nickname: users[1]['nickname'] },
        contentUrl: v.contentUrl,
        timeGap: timeGap(v['createdAt']),
      };
    });

    return returnedMessages;
  }

  update(id: number, updateDmDto: UpdateDmDto) {
    return `This action updates a #${id} dm`;
  }

  remove(id: number) {
    return `This action removes a #${id} dm`;
  }
}

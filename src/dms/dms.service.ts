import { Users } from '../entities/Users';
import { timeGap } from '../helper/timegap.helper';
import { Injectable } from '@nestjs/common';
import { PopupChatRoomDto } from './dto/popup.chatroom.dto';
import { UpdateDmDto } from './dto/update-dm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chattings } from '../entities/mongo/Chattings';
import { ChatRooms } from '../entities/mongo/ChatRoom';

@Injectable()
export class DmsService {
  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Chattings, 'mongodb')
    private readonly chattingsRepository: Repository<Chattings>,
    @InjectRepository(ChatRooms, 'mongodb')
    private readonly chatRoomsRepository: Repository<ChatRooms>,
  ) {}

  async popupChatRoom(popupChatRoomDto: PopupChatRoomDto) {
    const users =
      popupChatRoomDto.senderId < popupChatRoomDto.receiverId
        ? [popupChatRoomDto.senderId, popupChatRoomDto.receiverId]
        : [popupChatRoomDto.receiverId, popupChatRoomDto.senderId];

    const chatRoomsExist = await this.chatRoomsRepository.findOne({
      where: { users },
    });

    if (!chatRoomsExist) {
      const newChatRoom = new ChatRooms();
      newChatRoom.users = users;
      newChatRoom.createdAt = new Date();
      newChatRoom.updatedAt = new Date();

      const createdChatRooms = this.chatRoomsRepository.save(newChatRoom);

      return createdChatRooms;
    }
    return chatRoomsExist;
  }

  findAll() {
    return `This action returns all dms`;
  }

  async joinChatRoom(chatRoomId: string) {
    const messages = await this.chattingsRepository.find({
      where: { RoomId: chatRoomId },
    });
    const chatRoom = await this.chatRoomsRepository.findOne({
      where: {
        id: chatRoomId,
      },
    });

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname'])
      .where('id = :user0', { user0: chatRoom.users[0] })
      .orWhere('id = :user1', { user1: chatRoom.users[1] })
      .getMany();

    messages.sort((newChatRoom, b) => {
      if (
        typeof newChatRoom['createdAt'].getTime() === 'number' &&
        typeof b['createdAt'].getTime() === 'number'
      ) {
        return b['createdAt'].getTime() - newChatRoom['createdAt'].getTime();
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
    return `This action updates newChatRoom #${id} dm`;
  }

  remove(id: number) {
    return `This action removes newChatRoom #${id} dm`;
  }
}

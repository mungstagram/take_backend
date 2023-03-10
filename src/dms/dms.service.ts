import { ChatRooms } from './../entities/mongo/ChatRoom';
import { Users } from '../entities/Users';
import { timeGap } from '../helper/timegap.helper';
import { Injectable } from '@nestjs/common';
import { PopupChatRoomDto } from './dto/popup.chatroom.dto';
import { UpdateDmDto } from './dto/update-dm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chattings } from '../entities/mongo/Chattings';
import { randomUUID } from 'crypto';

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
    const user = await this.usersRepository.findOne({
      where: { nickname: popupChatRoomDto.receiverNickname },
    });

    popupChatRoomDto.receiverId = user.id;

    const users =
      popupChatRoomDto.senderId < popupChatRoomDto.receiverId
        ? [
            { id: popupChatRoomDto.senderId, exitedAt: new Date() },
            { id: popupChatRoomDto.receiverId, exitedAt: new Date() },
          ]
        : [
            { id: popupChatRoomDto.receiverId, exitedAt: new Date() },
            { id: popupChatRoomDto.senderId, exitedAt: new Date() },
          ];

    const userIds = [popupChatRoomDto.senderId, popupChatRoomDto.receiverId];
    const chatRoomsExist = await this.chatRoomsRepository.findOne({
      where: {
        users: {
          $all: userIds.map((id) => ({
            $elemMatch: { id },
          })),
        },
      },
    });

    if (!chatRoomsExist) {
      const newRoom = new ChatRooms();
      newRoom.users = users;
      newRoom.createdAt = new Date();
      newRoom.updatedAt = new Date();
      newRoom.roomId = randomUUID().replace(/-/g, '');

      console.log('uuid', newRoom.roomId);

      const createdChatRooms = this.chatRoomsRepository.save(newRoom);

      return createdChatRooms;
    }
    return chatRoomsExist;
  }

  findAll() {
    return `This action returns all dms`;
  }

  async joinChatRoom(roomId: string) {
    const messages = await this.chattingsRepository.find({
      where: { RoomId: roomId },
    });

    const room = await this.chatRoomsRepository.findOne({
      where: {
        roomId: roomId,
      },
    });

    const users = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname'])
      .where('id = :user0', { user0: room.users[0].id })
      .orWhere('id = :user1', { user1: room.users[1].id })
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
        createdAt: new Date(v.createdAt.getTime() + 9 * 3600 * 1000),
      };
    });

    return returnedMessages;
  }

  async getChatRoomList(userId: number) {
    const userChatRoomList = await this.chatRoomsRepository.find({
      where: { users: { $elemMatch: { id: userId } } },
    });

    const otherUserIds = userChatRoomList.map((v) => {
      if (v.users[0].id !== userId) return v.users[0].id;
      return v.users[1].id;
    });

    const getMyNickname = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['nickname'],
    });

    const getOtherUserNicknames = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname'])
      .where('u.id IN (:...ids)', { ids: otherUserIds })
      .getMany();

    const getUserChatRoomList = userChatRoomList.map((room) => {
      if (room.users[0].id === userId) {
        room.users[0].nickname = getMyNickname.nickname;

        for (const i of getOtherUserNicknames) {
          if (room.users[1].id === i.id) {
            room.users[1].nickname = i.nickname;
          }
        }

        return room;
      }

      room.users[1].nickname = getMyNickname.nickname;

      for (const i of getOtherUserNicknames) {
        if (room.users[0].id === i.id) {
          room.users[0].nickname = i.nickname;
        }
      }

      return room;
    });

    return userChatRoomList;
  }

  update(id: number, updateDmDto: UpdateDmDto) {
    return `This action updates newRoom #${id} dm`;
  }

  remove(id: number) {
    return `This action removes newRoom #${id} dm`;
  }
}

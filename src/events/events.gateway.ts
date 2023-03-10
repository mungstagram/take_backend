import { WebSocketExceptionFilter } from './../common/filter/ws.exception.filter';
import { mongoTimeGap } from '../helper/timegap.helper';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { DmsService } from './../dms/dms.service';
import { ChatRooms } from '../entities/mongo/ChatRoom';
import { Logger, BadRequestException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Chattings } from '../entities/mongo/Chattings';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { MongoRepository, Repository } from 'typeorm';

@WebSocketGateway(3001, {
  namespace: /dm\/.[a-zA-Z0-9]/g,
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    exposedHeaders: ['Authorization'],
  },
})
export class DMGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Chattings, 'mongodb')
    private readonly chattingsRepository: Repository<Chattings>,
    @InjectRepository(ChatRooms, 'mongodb')
    private readonly chatRoomsRepository: Repository<ChatRooms>,
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    private readonly dmsService: DmsService,
    private readonly jwtService: JwtService,
  ) {}
  @WebSocketServer() public server: Server;

  private users: object[] = [];

  async tokenValidate(token: string) {
    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return data;
    } catch (err) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const userData: JwtPayload = await this.tokenValidate(token);

      Logger.debug(
        { nspName: socket.nsp.name, ip: socket.handshake.address },
        'Connected',
      );

      this.users = await this.dmsService.getChatRoomList(userData.sub);

      if (!this.users.length)
        throw new BadRequestException('유효하지 않은 채팅방입니다.');

      const chatRoom = await this.chatRoomsRepository.findOne({
        where: { roomId: socket.nsp.name.substring(4, socket.nsp.name.length) },
      });

      const myUser = { id: userData.sub, exitedAt: null };
      const otherUser =
        chatRoom.users[0].id === myUser.id
          ? { id: chatRoom.users[1].id, exitedAt: chatRoom.users[1].exitedAt }
          : { id: chatRoom.users[0].id, exitedAt: chatRoom.users[0].exitedAt };

      const updateUsers =
        myUser.id < otherUser.id ? [myUser, otherUser] : [otherUser, myUser];

      await this.chatRoomsRepository.update(chatRoom.id, {
        users: updateUsers,
      });
      const getMessages = await this.dmsService.joinChatRoom(
        socket.nsp.name.substring(4, socket.nsp.name.length),
      );

      socket.emit('getMessages', getMessages);
    } catch (error) {
      Logger.error(error.message, 'DM Connect');
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const userData: JwtPayload = await this.tokenValidate(token);

      const chatRoom = await this.chatRoomsRepository.findOne({
        where: { roomId: socket.nsp.name.substring(4, socket.nsp.name.length) },
      });

      const myUser = { id: userData.sub, exitedAt: new Date() };
      const otherUser =
        chatRoom.users[0].id === myUser.id
          ? { id: chatRoom.users[1].id, exitedAt: chatRoom.users[1].exitedAt }
          : { id: chatRoom.users[0].id, exitedAt: chatRoom.users[0].exitedAt };

      const updateUsers =
        myUser.id < otherUser.id ? [myUser, otherUser] : [otherUser, myUser];

      await this.chatRoomsRepository.update(chatRoom.id, {
        users: updateUsers,
      });
    } catch (error) {
      Logger.error(error.message, 'DM DisConnect');
    }
  }

  @SubscribeMessage('dm')
  async handleDms(
    @MessageBody() data: { message: string; content?: Buffer; sender: number },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const userData: JwtPayload = await this.tokenValidate(token);
      const userId = userData.sub;

      const chatRoom = this.users.filter((v) => {
        if (
          v['roomId'] === socket.nsp.name.substring(4, socket.nsp.name.length)
        )
          return v;
      });
      console.log('users', this.users);
      console.log('a', chatRoom);

      const sender =
        userId === chatRoom[0]['users'][0]['id']
          ? {
              id: chatRoom[0]['users'][0]['id'],
              nickname: chatRoom[0]['users'][0]['nickname'],
            }
          : {
              id: chatRoom[0]['users'][1]['id'],
              nickname: chatRoom[0]['users'][1]['nickname'],
            };

      const receiver =
        userId !== chatRoom[0]['users'][0]['id']
          ? {
              id: chatRoom[0]['users'][0]['id'],
              nickname: chatRoom[0]['users'][0]['nickname'],
            }
          : {
              id: chatRoom[0]['users'][1]['id'],
              nickname: chatRoom[0]['users'][1]['nickname'],
            };

      console.log('b', sender, receiver);
      const now = new Date();

      await this.chattingsRepository.insert({
        message: data.message,
        contentUrl: '',
        SenderId: sender.id,
        ReceiverId: receiver.id,
        RoomId: socket.nsp.name.substring(4, socket.nsp.name.length),
        createdAt: now,
      });

      Logger.debug(
        {
          nspName: socket.nsp.name,
          ip: socket.handshake.address,
          sender: sender,
          receiver: receiver,
          message: data.message,
        },
        'Sent',
      );
      socket.emit('newDM', {
        ...data,
        sender: sender,
        receiver: receiver,
        createdAt: new Date(now.getTime() + 9 * 3600 * 1000),
      });

      socket.broadcast.emit('newDM', {
        ...data,
        sender: sender,
        receiver: receiver,
        createdAt: new Date(now.getTime() + 9 * 3600 * 1000),
      });
    } catch (error) {
      Logger.error(error, 'DM');
    }
  }
}

@WebSocketGateway(3001, {
  namespace: '/DMList',
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    exposedHeaders: ['Authorization'],
  },
})
export class ChatRoomsGateway implements OnGatewayConnection {
  constructor(
    @InjectRepository(ChatRooms, 'mongodb')
    private readonly chatRoomsRepository: Repository<ChatRooms>,
    @InjectRepository(Chattings, 'mongodb')
    private readonly chattingsRepository: MongoRepository<Chattings>,
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async tokenValidate(token: string) {
    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return data;
    } catch (err) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const userData: JwtPayload = await this.tokenValidate(token);

      const userChatRoomList = await this.chatRoomsRepository.find({
        where: { users: { $elemMatch: { id: userData.sub } } },
      });

      const arrayChatRoomId = userChatRoomList.map((room) => room.roomId);

      const lastChats = await this.chattingsRepository
        .aggregate([
          {
            $lookup: {
              from: 'chatRooms',
              localField: 'RoomId',
              foreignField: 'roomId',
              as: 'room',
            },
          },
          {
            $match: {
              'room.roomId': {
                $in: arrayChatRoomId,
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $group: {
              _id: '$RoomId',
              lastChat: {
                $first: '$$ROOT',
              },
            },
          },
        ])
        .toArray();

      const myUserId = userData.sub;

      const chatRooms = await Promise.all(
        lastChats.map(async (v) => {
          const otherUser =
            v.lastChat['room'][0]['users'][0]['id'] === myUserId
              ? {
                  id: v.lastChat['room'][0]['users'][1]['id'],
                  exitedAt: v.lastChat['room'][0]['users'][1]['exitedAt'],
                }
              : {
                  id: v.lastChat['room'][0]['users'][0]['id'],
                  exitedAt: v.lastChat['room'][0]['users'][0]['exitedAt'],
                };
          const myExitedAt =
            v.lastChat['room'][0]['users'][0]['id'] === myUserId
              ? v.lastChat['room'][0]['users'][0]['exitedAt']
              : v.lastChat['room'][0]['users'][1]['exitedAt'];

          const user = await this.usersRepository
            .createQueryBuilder('u')
            .select(['u.id', 'u.nickname', 'uf.contentUrl'])
            .leftJoin('u.File', 'uf')
            .where('u.id = :userId', { userId: otherUser.id })
            .getOne();

          const unreadCount = await this.chattingsRepository.count({
            RoomId: v.lastChat.RoomId,
            createdAt: { $gt: myExitedAt },
          });

          return {
            roomId: v.lastChat.RoomId,
            nickname: user.nickname,
            lastChat: v.lastChat.message,
            profileUrl: user.File ? user.File['contentUrl'] : '',
            unreadCount: unreadCount,
            timeGap: mongoTimeGap(v.lastChat.createdAt),
          };
        }),
      );

      socket.emit('DMList', chatRooms);
    } catch (error) {
      Logger.error(error.message, 'DMList');
    }
  }
}
@WebSocketGateway(3001, { namespace: /test\/.+/ })
export class TestGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  async handleConnection(@ConnectedSocket() socket: Socket) {
    socket.emit('testConnect', `연결 성공 Namespace : ${socket.nsp.name}`);
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    socket.emit('testDisconnect', `연결 끊김 Namespace : ${socket.nsp.name}`);
  }
}

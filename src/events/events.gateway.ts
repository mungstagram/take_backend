import { WebSocketExceptionFilter } from './../common/filter/ws.exception.filter';
import { timeGap } from 'src/helper/timegap.helper';
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
import { WsException } from '@nestjs/websockets/errors';

const users: object[] = [];

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
    const token = socket.handshake.headers.authorization.split(' ')[1];
    const userData: JwtPayload = await this.tokenValidate(token);

    Logger.log(socket.nsp.name, 'Connected');

    if (!users.length) {
      const chatRoomUsers = await this.chatRoomsRepository.findOne({
        where: {
          roomId: socket.nsp.name.substring(4, socket.nsp.name.length),
        },
      });

      if (!chatRoomUsers) throw new WebSocketExceptionFilter();

      const usersNickname = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.nickname'])
        .where('u.id = :user0', { user0: chatRoomUsers.users[0].id })
        .orWhere('u.id = :user1', { user1: chatRoomUsers.users[1].id })
        .getMany();

      users.push(usersNickname[0]);
      users.push(usersNickname[1]);
    }

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
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
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

    await this.chatRoomsRepository.update(chatRoom.id, { users: updateUsers });
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

      const sender =
        userId === users[0]['id']
          ? { id: users[0]['id'], nickname: users[0]['nickname'] }
          : { id: users[1]['id'], nickname: users[1]['nickname'] };

      const receiver =
        userId !== users[0]['id']
          ? { id: users[0]['id'], nickname: users[0]['nickname'] }
          : { id: users[1]['id'], nickname: users[1]['nickname'] };

      // const contentUrl = data.content ? fileUpload(data.content) : null;
      await this.chattingsRepository.insert({
        message: data.message,
        contentUrl: '',
        SenderId: sender.id,
        ReceiverId: receiver.id,
        RoomId: socket.nsp.name.substring(4, socket.nsp.name.length),
        createdAt: new Date(),
      });

      socket.emit('newDM', { ...data, sender: sender, receiver: receiver });

      socket.broadcast.emit('newDM', {
        ...data,
        sender: sender,
        receiver: receiver,
      });
    } catch (error) {
      Logger.error(error.message, 'DM');
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
      const otherUsers = lastChats.map((v) => {
        return v.lastChat['room'][0]['users'][0]['id'] === myUserId
          ? {
              id: v.lastChat['room'][0]['users'][1]['id'],
              exitedAt: v.lastChat['room'][0]['users'][1]['exitedAt'],
            }
          : {
              id: v.lastChat['room'][0]['users'][0]['id'],
              exitedAt: v.lastChat['room'][0]['users'][0]['exitedAt'],
            };
      });
      const otherUserIds = otherUsers.map((v) => v.id);

      const users = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.nickname', 'uf.contentUrl'])
        .leftJoin('u.File', 'uf')
        .where('u.id In (:...ids)', { ids: otherUserIds })
        .getMany();

      const chatRooms = lastChats.map((v, i) => {
        return {
          roomId: v.lastChat.RoomId,
          nickname: users[i].nickname,
          lastChat: v.lastChat.message,
          profileUrl: users[i].File['contentUrl'],
          timeGap: timeGap(v.lastChat.createdAt),
        };
      });

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

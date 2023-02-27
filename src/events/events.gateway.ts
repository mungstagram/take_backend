import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { SocketIOAuthGuard } from './socket.jwt.guard';
import { DmsService } from './../dms/dms.service';
import { ChatRooms } from '../entities/mongo/ChatRoom';
import { Logger, BadRequestException, UseGuards } from '@nestjs/common';
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
import { Repository } from 'typeorm';
import { GetPayload } from 'src/common/dacorators/get.payload.decorator';

const users: object[] = [];

@WebSocketGateway(80, { namespace: /dm\/.[a-zA-Z0-9]/g })
export class DMGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Chattings, 'mongodb')
    private readonly chattingsRepository: Repository<Chattings>,
    @InjectRepository(ChatRooms, 'mongodb')
    private readonly chatRoomsRepository: Repository<ChatRooms>,
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    private readonly dmsService: DmsService,
  ) {}
  @WebSocketServer() public server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(socket.handshake.headers);
    Logger.log(socket.nsp.name, 'Connected');
    // console.log(socket.handshake.headers.authorization);

    if (!users.length) {
      const chatRoomUsers = await this.chatRoomsRepository.findOne({
        where: {
          roomId: socket.nsp.name.substring(4, socket.nsp.name.length),
        },
      });

      if (!chatRoomUsers)
        throw new BadRequestException('존재하지 않는 채팅방 입니다.');

      const usersNickname = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.nickname'])
        .where('id = :user0', { user0: chatRoomUsers.users[0] })
        .orWhere('id = :user1', { user1: chatRoomUsers.users[1] })
        .getMany();

      users.push(usersNickname[0]);
      users.push(usersNickname[1]);
    }

    const getMessages = await this.dmsService.joinChatRoom(
      socket.nsp.name.substring(4, socket.nsp.name.length),
    );

    socket.emit('getMessages', getMessages);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    Logger.log(socket.nsp.name, 'DisConnect');
  }

  @SubscribeMessage('dm')
  async handleDms(
    @MessageBody() data: { message: string; content?: Buffer; sender: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const sender =
      data.sender === users[0]['id']
        ? { id: users[0]['id'], nickname: users[0]['nickname'] }
        : { id: users[1]['id'], nickname: users[1]['nickname'] };

    const receiver =
      data.sender !== users[0]['id']
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

    socket.broadcast.emit('newDM', {
      ...data,
      // mesage: data.message,
      // contentUrl: data.content,
      sender: sender,
      receiver: receiver,
    });
  }
}

@WebSocketGateway(80, { namespace: /DMList\/.[0-9]/ })
export class ChatRoomsGateway implements OnGatewayConnection {
  @SubscribeMessage('test')
  async handleConnection(@ConnectedSocket() socket: Socket) {
    Logger.log(socket.nsp.name, 'Connected');
    socket.broadcast.emit('test', '잘 도착 하는지 모르겠네요');
  }
}
@WebSocketGateway(80, { namespace: /test\/.+/ })
export class TestGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  async handleConnection(@ConnectedSocket() socket: Socket) {
    socket.emit('testConnect', `연결 성공 Namespace : ${socket.nsp.name}`);
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    socket.emit('testDisconnect', `연결 끊김 Namespace : ${socket.nsp.name}`);
  }
}

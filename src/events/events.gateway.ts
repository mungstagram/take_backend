import { ChatRooms } from '../entities/mongo/ChatRoom';
import { Logger } from '@nestjs/common';
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

const users: object[] = [];

@WebSocketGateway(80, { namespace: /[a-zA-Z0-9]/g })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Chattings, 'mongodb')
    private readonly chattingsRepository: Repository<Chattings>,
    @InjectRepository(ChatRooms, 'mongodb')
    private readonly chatRoomsRepository: Repository<ChatRooms>,
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
  ) {}
  @WebSocketServer() public server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    Logger.log(socket.nsp.name, 'Connected');

    if (!users.length) {
      const chatRoomUsers = await this.chatRoomsRepository.findOne({
        where: { id: socket.nsp.name },
      });

      const usersNickname = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.nickname'])
        .where('id = :user0', { user0: chatRoomUsers.users[0] })
        .orWhere('id = :user1', { user1: chatRoomUsers.users[1] })
        .getMany();

      users.push(usersNickname[0]);
      users.push(usersNickname[1]);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    Logger.log(socket.nsp.name, 'DisConnect');
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string) {
    Logger.log(data, 'test');
    this.server.emit('dm', '테스트테스트트트');
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
      RoomId: socket.nsp.name.split('/')[1],
    });

    socket.broadcast.emit('newChat', {
      ...data,
      sender: sender,
      receiver: receiver,
    });
  }
}

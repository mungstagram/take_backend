import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt/jwt.payload.dto';

@Injectable()
export class SocketIOAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    console.log('hihihihihi');
    const client: Socket = context.switchToWs().getClient();
    const token: string = client.handshake.headers.authorization.split(' ')[1];

    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);

    if (!decoded) {
      throw new UnauthorizedException(
        'You are not authorized to connect to this socket.',
      );
    }

    return true;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new WsException(info.message);
    }
    return user;
  }
}

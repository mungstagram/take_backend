import { JwtService } from '@nestjs/jwt';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGard extends AuthGuard('jwt') {
  // handleRequest<TUser = any>(
  //   err: any,
  //   user: any,
  //   info: any,
  //   context: ExecutionContext,
  //   status?: any,
  // ): TUser {
  //   // * Token : context.switchToHttp().getRequest().headers['authorization']
  //   if (user) return user;
  //   if (info.message === 'jwt expired') {
  //     return context.switchToHttp().getRequest().headers['authorization'];
  //   }
  //   return user;
  // }
}

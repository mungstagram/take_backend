import { LoginRequestDto } from './dtos/login.request.dto';
import { Users } from './../entities/Users';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Tokens } from '../entities/Tokens';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Tokens)
    private readonly tokensRepository: Repository<Tokens>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequestDto: LoginRequestDto) {
    const { email, password } = loginRequestDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('존재하지 않는 이메일 입니다.');
    if (!(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('로그인에 실패하였습니다.');

    try {
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      );

      const refreshToken = await this.jwtService.signAsync(
        {},
        { secret: process.env.JWT_SECRET, expiresIn: '7d' },
      );

      await this.tokensRepository.insert({
        UserId: user.id,
        token: refreshToken,
      });

      return { accessToken, nickname: user.nickname };
    } catch (error) {
      throw new BadRequestException(error.messgae);
    }
  }
}

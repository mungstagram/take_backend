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

  async tokenFindByUserId(UserId: number) {
    return await this.tokensRepository.findOne({ where: { UserId } });
  }

  async refreshTokenFindByUserId(refreshToken: string) {
    const findToken = await this.tokensRepository.findOne({
      where: { token: refreshToken },
    });

    if (!findToken)
      throw new UnauthorizedException('해당하는 토큰이 존재하지 않습니다.');

    const user = await this.usersRepository.findOne({
      where: { id: findToken.UserId },
    });

    return user.id;
  }

  async accessTokenGenerateByRefreshToken(accessToken: string) {}

  async login(loginRequestDto: LoginRequestDto) {
    const { email, password } = loginRequestDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('존재하지 않는 이메일 입니다.');
    if (!(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('로그인에 실패하였습니다.');

    try {
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      const existRefreshToken = await this.tokenFindByUserId(user.id);

      if (existRefreshToken)
        await this.tokensRepository.delete({ UserId: user.id });

      const refreshToken = await this.jwtService.signAsync(
        {},
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      // const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

      await this.tokensRepository.insert({
        UserId: user.id,
        token: refreshToken,
      });

      return { accessToken, nickname: user.nickname };
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException(error.messgae);
    }
  }
}

import { SignupReqeustDto } from './../users/dtos/signup.request.dto';
import { UsersService } from './../users/users.service';
import { KakaoRequestDto } from './dtos/kakao.request.dto';
import { LoginRequestDto } from './dtos/login.request.dto';
import { Users } from '../entities/Users';
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
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Tokens, 'postgresql')
    private readonly tokensRepository: Repository<Tokens>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
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

  async validateRefreshToken(refreshToken: string) {
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  async accessTokenGenerateByRefreshToken(accessToken: string) {
    if (!accessToken)
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');

    const [authTpye, authToken] = accessToken.split(' ');
    const payload = this.jwtService.decode(authToken);

    if (!(typeof payload === 'object'))
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');

    const token = await this.tokenFindByUserId(payload.sub);

    if (!token) throw new UnauthorizedException('잘못된 토큰입니다.');

    const validateRefreshToken = await this.validateRefreshToken(token.token);

    if (!validateRefreshToken)
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');

    const newAccessToken = await this.jwtService.signAsync(
      {
        id: token.UserId,
      },
      { expiresIn: '1h', secret: process.env.JWT_ACCESS_SECRET },
    );

    return newAccessToken;
  }

  async login(loginRequestDto: LoginRequestDto) {
    const { email, password } = loginRequestDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('존재하지 않는 이메일 입니다.');
    if (!(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('로그인에 실패하였습니다.');

    try {
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1d' },
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

  async googleLogin(data) {
    if (!data) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: data,
    };
  }

  async kakaoLogin(token: string) {
    if (!token) {
      return 'No user from kakao';
    }

    return {
      message: 'User information from kakao',
      user: token,
    };
  }

  async createNickname(userId: number, data: { nickname: string }) {
    const nicknameRegexp = /^[a-zA-Z0-9]{3,10}$/g;
    if (!nicknameRegexp.test(data.nickname)) {
      throw new BadRequestException('올바르지 않은 데이터 형식입니다.');
    }

    const existNick = await this.usersRepository.findOne({
      where: { nickname: data.nickname },
    });

    if (existNick)
      throw new BadRequestException('이미지 존재하는 닉네임입니다.');

    const updateNickname = await this.usersRepository.update(
      { id: userId },
      { nickname: data.nickname },
    );

    if (updateNickname.affected === 1) {
      const userData = await this.usersRepository.findOne({
        where: { id: userId },
      });

      return { nickname: userData.nickname };
    } else {
      throw new BadRequestException('닉네임 등록에 실패했습니다.');
    }
  }

  async kakaoAuth(kakaoRequestDto: KakaoRequestDto) {
    const getUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const axiosHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      Authorization: `Bearer ${kakaoRequestDto.accessToken}`,
    };

    const res = await axios({
      method: 'GET',
      url: getUserInfoUrl,
      timeout: 100000,
      headers: axiosHeaders,
    });

    const kakaoId = res.data.id;

    const user = await this.usersRepository.findOne({
      where: { email: kakaoId },
    });

    if (!user) {
      const newUserData = new SignupReqeustDto();
      newUserData.email = kakaoId;
      newUserData.provider = 'kakao';

      const newUser = await this.usersService.signup(newUserData);

      const accessToken = await this.jwtService.signAsync(
        { sub: newUser.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1d' },
      );

      return { nickname: null, authorization: accessToken };
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1d' },
    );

    return { nickname: user.nickname, authorization: accessToken };
  }
}

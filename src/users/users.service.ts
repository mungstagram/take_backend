import { UserCheckRequestDto } from './dtos/user.reqeust.dto';
import { SignupReqeustDto } from './dtos/signup.request.dto';
import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findById(id: number) {
    return await this.usersRepository.findOne({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email: email } });
  }

  async signup(data: SignupReqeustDto) {
    const email = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (email) throw new ConflictException('이미 존재하는 이메일 입니다.');

    const nickname = await this.usersRepository.findOne({
      where: { nickname: data.nickname },
    });

    if (nickname && data.provider === 'local')
      throw new ConflictException('이미 존재하는 닉네임 입니다.');

    const hashedPassword =
      data.provider === 'local' ? await bcrypt.hash(data.password, 12) : null;

    const insertedUser = await this.usersRepository.insert({
      email: data.email,
      name: data.name,
      nickname: data.nickname,
      password: data.provider === 'local' ? hashedPassword : 'KAKAO',
      provider: data.provider,
    });

    return { id: insertedUser.identifiers[0].id };
  }

  async check(userCheckRequestDto: UserCheckRequestDto) {
    if (Object.keys(userCheckRequestDto).length !== 1)
      throw new BadRequestException('올바르지 않은 데이터 형식입니다.');

    const nicknameOrEmail = userCheckRequestDto.nickname
      ? userCheckRequestDto.nickname
      : userCheckRequestDto.email
      ? userCheckRequestDto.email
      : false;

    if (!nicknameOrEmail)
      throw new BadRequestException('올바르지 않은 데이터 형식입니다.');

    const nicknameRegexp = /^[a-zA-Z0-9]{3,10}$/g;
    const emailRegexp =
      /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/i;

    const isCorrect = nicknameRegexp.test(nicknameOrEmail)
      ? { nickname: nicknameOrEmail }
      : emailRegexp.test(nicknameOrEmail)
      ? { email: nicknameOrEmail }
      : false;

    if (!isCorrect)
      throw new BadRequestException('올바르지 않은 데이터 형식입니다.');

    const user = await this.usersRepository.findOne({
      where: { ...isCorrect },
    });

    if (user)
      throw new ConflictException(
        `이미 존재하는 ${Object.keys(isCorrect)[0]} 입니다.`,
      );

    return true;
  }

  async loadUserData(nickname: string, userId: number) {
    const userData = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.nickname', 'u.introduce', 'u.id', 'uf.contentUrl'])
      .leftJoin('u.File', 'uf')
      .loadRelationCountAndMap('u.postsCount', 'u.Posts')
      .loadRelationCountAndMap('u.dogsCount', 'u.Dogs')
      .where('u.nickname =:nickname', { nickname: nickname })
      .getOne();

    if (!userData) {
      throw new BadRequestException('해당 데이터가 존재하지 않습니다');
    }

    return {
      nickname: userData.nickname,
      introduce: userData.introduce ? userData.introduce : '',
      contentUrl: userData.File ? userData.File['contentUrl'] : '',
      postsCount: userData['postsCount'],
      dogsCount: userData['dogsCount'],
    };
  }

  async leave(userId: number) {
    const leaveUser = await this.usersRepository.delete(userId);

    if (leaveUser.affected === 0)
      throw new BadRequestException('존재하지 않는 유저입니다.');

    return '탈퇴가 완료되었습니다.';
  }
}

import { Dogs } from './../entities/Dogs';
import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import {
  SignupReqeustDto,
  UserDataRequestsDto,
} from './dtos/signup.request.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { GitModule } from '@faker-js/faker';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Dogs)
    private readonly dogsRepository: Repository<Dogs>,
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

    if (nickname) throw new ConflictException('이미 존재하는 닉네임 입니다.');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await this.usersRepository.insert({
      email: data.email,
      name: data.name,
      nickname: data.nickname,
      password: hashedPassword,
      provider: data.provider,
      profile_image: data.profile_image,
    });

    return 'Created';
  }

  async getUserData(payload: JwtPayload) {
    const userId = payload.sub;
    const userData = await this.usersRepository.findOne({
      where: { id: userId },
    });

    const userDogsData = await this.dogsRepository.findBy({
      UserId: userId,
    });

    const dogsData = userDogsData.map((dog) => {
      const result = {
        dogName: dog.name,
        dogBirthday: dog.birthday,
        dogGender: dog.gender,
      };

      return result;
    });

    const data = {
      userId: userData.id,
      nickname: userData.nickname,
      introduce: userData.introduce,
      profile_image: userData.profile_image,
      dogs: dogsData,
    };

    return data;
  }

  async updateUserData(payload: JwtPayload, data: UserDataRequestsDto) {
    const userId = payload.sub;
    const { nickname, introduce, profile_image } = data;
  }
}

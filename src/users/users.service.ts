import { SingupRequestDto } from './dtos/signup.request.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Repository, DataSource } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findById(id: number) {
    return await this.usersRepository.findOne({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email: email } });
  }

  async signup(data: SingupRequestDto) {
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
}

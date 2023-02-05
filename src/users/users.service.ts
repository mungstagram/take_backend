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

  async signup(data: SingupRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email: data.email } });

    if (user) throw new ConflictException('이미 존재하는 사용자 입니다.');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    try {
      await queryRunner.manager.getRepository(Users).save({
        email: data.email,
        name: data.name,
        nickname: data.nickname,
        password: hashedPassword,
        provider: data.provider,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
      return;
    }
  }
}

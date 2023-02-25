import { Users } from '../entities/Users';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class SearchesService {
  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
  ) {}
  async search(query: { category: string; search: string }) {
    if (query.category === 'users') {
      const searchedData = await this.usersRepository.find({
        where: { nickname: Like(`%${query.search}%`) },
      });

      const data = searchedData.map((user) => {
        return {
          userId: user.id,
          nickname: user.nickname,
          introduce: user.introduce ? user.introduce : '',
          contentUrl: user.contentUrl ? JSON.parse(user.contentUrl) : [],
        };
      });

      return data;
    } else {
      throw new BadRequestException('해당 카테고리가 없습니다');
    }
  }
}

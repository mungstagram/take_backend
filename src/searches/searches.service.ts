import { Users } from '../entities/Users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class SearchesService {
  constructor(
    @InjectRepository(Users)
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
          introduce: user.introduce,
          contentUrl: JSON.parse(user.fileUrl),
        };
      });

      return data;
    }
  }
}

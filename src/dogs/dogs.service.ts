import { DogCreateRequestDto } from './dtos/dog.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dogs } from '../entities/Dogs';
import { Repository } from 'typeorm';

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dogs) private readonly dogsRepository: Repository<Dogs>,
  ) {}

  async getDog(userId: number) {
    const dogs = await this.dogsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.UserId',
        'd.name',
        'd.birthday',
        'd.gender',
        'd.photos',
      ])
      .where('UserId = :userId', { userId })
      .getMany();

    return dogs;
  }

  async createDog(dogCreateRequestDto: DogCreateRequestDto) {
    const dog = await this.dogsRepository.insert({ ...dogCreateRequestDto });

    return dog;
  }

  async updateDog() {}

  async deleteDog() {}
}

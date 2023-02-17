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

  async createDog(dogCreateRequestDto: DogCreateRequestDto) {
    const userId = dogCreateRequestDto.UserId;
    const dogExist = await this.dogsRepository.findBy({ UserId: userId });
    console.log(dogExist[0]);
    const representative = dogExist[0] === undefined ? true : false;
    const dog = await this.dogsRepository.insert({
      representative: representative,
      ...dogCreateRequestDto,
    });

    return dog;
  }
}

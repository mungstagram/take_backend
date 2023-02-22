import { AWSService } from './../helper/fileupload.helper';
import { DogCreateRequestDto } from './dtos/dog.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dogs } from '../entities/Dogs';
import { Repository } from 'typeorm';

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dogs) private readonly dogsRepository: Repository<Dogs>,
    private readonly awsService: AWSService,
  ) {}

  async createDog(
    dogCreateRequestDto: DogCreateRequestDto,
    files: Array<Express.Multer.File>,
  ) {
    const userId = dogCreateRequestDto.UserId;

    //강아지 이미지 s3에 저장
    const category = 'dog';
    const dogImage = await this.awsService.fileUploads(files, category);

    const contentUrl = dogImage.map((v) => {
      return v.contentUrl;
    });

    //유저에게 강아지가 있는지 확인 후에 첫번째 강아지는 대표강아지 지정
    const dogExist = await this.dogsRepository.findOne({
      where: { UserId: userId },
    });

    const representative = !dogExist ? true : false;
    const dog = await this.dogsRepository.insert({
      representative: representative,
      fileUrl: JSON.stringify(contentUrl),
      ...dogCreateRequestDto,
    });

    return {
      id: dog.identifiers[0].id,
      name: dogCreateRequestDto.name,
      introduce: dogCreateRequestDto.introduce,
      species: dogCreateRequestDto.species,
      weight: dogCreateRequestDto.weight,
      birthday: dogCreateRequestDto.birthday,
      bringDate: dogCreateRequestDto.bringDate,
      contentUrl: contentUrl[0],
    };
  }
}

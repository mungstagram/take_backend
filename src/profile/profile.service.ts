import { DogUpdateRequestsDto } from './dto/dogupdate.request.dto';
import { join } from 'path';
import { Files } from '../entities/Files';
import { UserCheckRequestDto } from './../users/dtos/user.reqeust.dto';
import { AWSService } from './../helper/fileupload.helper';
import { ConfigService } from '@nestjs/config';
import { Dogs } from '../entities/Dogs';
import { Users } from '../entities/Users';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService,
    @InjectRepository(Dogs, 'postgresql')
    private readonly dogsRepository: Repository<Dogs>,
    @InjectRepository(Files, 'postgresql')
    private readonly filesRepository: Repository<Files>,
    private readonly awsService: AWSService,
    private readonly usersService: UsersService,
  ) {}

  //홈화면 유저 프로필
  async getHomeUserProfile(userId: number) {
    const userData = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.nickname', 'uf.contentUrl'])
      .leftJoin('u.File', 'uf')
      .where('u.id = :id', { id: userId })
      .getOne();

    const allDogs = await this.dogsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.species',
        'd.weight',
        'd.representative',
        'd.birthday',
        'd.bringDate',
        'df.contentUrl',
      ])
      .leftJoin('d.File', 'df')
      .where('d.UserId = :userId', { userId: userId })
      .orderBy('d.representative', 'ASC')
      .addOrderBy('d.createdAt', 'ASC')
      .getMany();

    if (!userData) {
      throw new BadRequestException('해당 유저 데이터가 없습니다.');
    }

    const now = new Date();

    const allDogsData = allDogs.map((dog) => {
      //함께한 날짜 구하기
      const daysWithin = Math.floor(
        (now.getTime() - new Date(dog.bringDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      //강아지 나이 구하기
      const ageYear = now.getFullYear() - new Date(dog.birthday).getFullYear();
      const ageMonth = now.getMonth() - new Date(dog.birthday).getMonth();
      const age =
        ageMonth < 0
          ? `${ageYear - 1}년 ${ageMonth + 12}개월`
          : `${ageYear}년 ${ageMonth}개월`;

      return {
        id: dog.id,
        name: dog.name,
        contentUrl: dog.File['contentUrl'],
        daysWithin: daysWithin,
        age: age,
        species: dog.species,
        weight: dog.weight.toFixed(1),
        representative: dog.representative,
        birthday: dog.birthday,
      };
    });

    allDogsData.sort((a, b) =>
      a.representative === b.representative
        ? 0
        : a
        ? -1
        : 1 || a.birthday.getTime() - b.birthday.getTime(),
    );

    const data = [
      {
        user: {
          nickname: userData.nickname,
          contentUrl: userData.File ? userData.File['contentUrl'] : '',
        },
      },
      { dogs: allDogsData },
    ];

    return data;
  }

  //유저 프로필 조회 service
  async getUserProfile(nickname: string) {
    const userData = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname', 'u.introduce', 'uf.contentUrl'])
      .leftJoin('u.File', 'uf')
      .where('u.nickname = :nickname', { nickname })
      .getOne();

    if (!userData) {
      throw new BadRequestException('해당 유저 데이터가 없습니다.');
    }

    const allDogs = await this.dogsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.species',
        'd.weight',
        'd.representative',
        'd.birthday',
        'd.bringDate',
        'd.introduce',
        'df.contentUrl',
      ])
      .leftJoin('d.File', 'df')
      .where('d.UserId = :userId', { userId: userData.id })
      .orderBy('d.representative', 'DESC')
      .addOrderBy('d.birthday', 'ASC')
      .getMany();

    const allDogsData = allDogs.map((dog) => {
      return {
        id: dog.id,
        name: dog.name,
        contentUrl: dog.File['contentUrl'],
        introduce: dog.introduce,
        species: dog.species,
        weight: dog.weight,
        birthday: dog.birthday,
        bringDate: dog.bringDate,
        representative: dog.representative,
      };
    });

    const data = [
      {
        user: {
          nickname: userData.nickname,
          contentUrl: userData.File ? userData.File['contentUrl'] : '',
          introduce: userData.introduce,
          dogsCount: allDogs.length,
        },
      },
      { dogs: allDogsData },
    ];

    return data;
  }

  async updateUserProfile(
    nickname: string,
    userId: number,
    files: Array<Express.Multer.File>,
    data: { introduce: string; changeNickname: string },
  ) {
    const nicknameRegexp = /^[a-zA-Z0-9]{3,10}$/g;

    if (!nicknameRegexp.test(nickname))
      throw new BadRequestException('올바르지 않은 닉네임 형식입니다.');

    const userData = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickname', 'u.introduce', 'uf.contentUrl'])
      .leftJoin('u.File', 'uf')
      .loadRelationCountAndMap('u.dogsCount', 'u.Dogs')
      .where('u.nickname = :nickname', { nickname })
      .getOne();

    if (!userData) {
      throw new BadRequestException('해당 유저 데이터가 없습니다.');
    }
    if (userId !== userData.id) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }

    const userCheckRequestDto = new UserCheckRequestDto();
    userCheckRequestDto.nickname = data.changeNickname;

    if (data.changeNickname !== userData.nickname) {
      await this.usersService.check({
        ...userCheckRequestDto,
      });
    }

    //s3에 새로운 프로필 이미지 저장
    const category = 'user';
    const newProfileImage = files[0]
      ? await this.awsService.fileUploads(files, category)
      : [
          {
            id: userData.FileId,
            contentUrl: userData.File ? userData.File['contentUrl'] : '',
          },
        ];

    //유저 정보 업데이트
    await this.usersRepository
      .createQueryBuilder()
      .update(Users)
      .set({
        nickname: data.changeNickname,
        introduce: data.introduce,
        FileId: newProfileImage[0].id,
      })
      .where('id=:userId', { userId: userId })
      .execute();

    return {
      nickname: data.changeNickname,
      introduce: data.introduce,
      contentUrl: newProfileImage[0].contentUrl,
      dogsCount: userData['dogsCount'],
    };
  }

  async updateDogProfile(
    id: number,
    userId: number,
    files: Array<Express.Multer.File>,
    data: DogUpdateRequestsDto,
  ) {
    //강아지 정보 받아오고 에러처리
    const dogData = await this.dogsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.species',
        'd.weight',
        'd.representative',
        'd.birthday',
        'd.bringDate',
        'd.UserId',
        'df.contentUrl',
      ])
      .leftJoin('d.File', 'df')
      .where('d.id = :id', { id })
      .getOne();

    if (!dogData) {
      throw new BadRequestException('해당 강아지 데이터가 없습니다.');
    } else if (userId !== dogData.UserId) {
      throw new UnauthorizedException('수정 권한이 없습니다');
    }

    //대표여부 true인 경우에 모든 강아지 false로 변경 (이후 해당 강아지 true로 작업)
    if (data.representative === true) {
      await this.dogsRepository
        .createQueryBuilder()
        .update(Dogs)
        .set({ representative: false })
        .where('UserId = :userId', { userId: userId })
        .execute();

      await this.dogsRepository
        .createQueryBuilder()
        .update(Dogs)
        .set({ representative: true })
        .where('id = :id', { id: id })
        .execute();
    }

    // s3에 새로운 강아지 프로필 이미지 저장
    const category = 'dog';
    const newDogImage = files[0]
      ? await this.awsService.fileUploads(files, category)
      : [{ id: dogData.id, contentUrl: dogData.File['contentUrl'] }];

    //강아지 정보 업데이트
    this.dogsRepository
      .createQueryBuilder()
      .update(Dogs)
      .set({
        name: data.name,
        introduce: data.introduce,
        species: data.species,
        weight: data.weight,
        birthday: data.birthday,
        bringDate: data.bringDate,
        FileId: newDogImage[0].id,
      })
      .where('id= :id', { id: id })
      .execute();

    const allDogs = await this.dogsRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.name',
        'd.species',
        'd.weight',
        'd.representative',
        'd.birthday',
        'd.bringDate',
        'd.introduce',
        'df.contentUrl',
      ])
      .leftJoin('d.File', 'df')
      .where('d.UserId = :userId', { userId })
      .orderBy('d.representative', 'DESC')
      .addOrderBy('d.birthday', 'ASC')
      .getMany();

    const allDogsData = allDogs.map((dog) => {
      return {
        id: dog.id,
        name: dog.name,
        contentUrl: dog.File['contentUrl'],
        introduce: dog.introduce,
        species: dog.species,
        weight: dog.weight,
        birthday: dog.birthday,
        bringDate: dog.bringDate,
        representative: dog.representative,
      };
    });

    return {
      dogs: allDogsData,
    };
  }
}

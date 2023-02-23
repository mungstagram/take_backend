import { AWSService } from './../helper/fileupload.helper';
import { ConfigService } from '@nestjs/config';
import { Dogs } from './../entities/Dogs';
import { Users } from './../entities/Users';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';

@Injectable()
export class ProfileService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService,
    @InjectRepository(Dogs)
    private readonly dogsRepository: Repository<Dogs>,
    private readonly awsService: AWSService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  //홈화면 유저 프로필
  async getHomeUserProfile(userId: number) {
    const userData = await this.usersRepository.findBy({ id: userId });
    const allDogs = await this.dogsRepository.findBy({
      UserId: userId,
    });

    const now = new Date();

    const allDogsData = allDogs.map((dog) => {
      //함께한 날짜 구하기
      const daysWithin = Math.floor(
        (now.getTime() - dog.bringDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      //강아지 나이 구하기
      const ageYear = now.getFullYear() - dog.birthday.getFullYear();
      const ageMonth = now.getMonth() - dog.birthday.getMonth();
      const age =
        ageMonth < 0
          ? `${ageYear - 1}년 ${ageMonth + 12}개월`
          : `${ageYear}년 ${ageMonth}개월`;

      return {
        id: dog.id,
        name: dog.name,
        contentUrl: dog.fileUrl.length !== 0 ? JSON.parse(dog.fileUrl) : null,
        daysWithin: daysWithin,
        age: age,
        species: dog.species,
        weight: dog.weight.toFixed(1),
        gender: dog.gender === true ? '수컷' : '암컷',
        introduce: dog.introduce,
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
          nickname: userData[0].nickname,
          contentUrl: JSON.parse(userData[0].fileUrl),
        },
      },
      { dogs: allDogsData },
    ];

    return data;
  }

  //유저 프로필 조회 service
  async getUserProfile(nickname: string) {
    const userData = await this.usersRepository.findBy({
      nickname: nickname,
    });

    const allDogs = await this.dogsRepository.findBy({
      UserId: userData[0].id,
    });

    const allDogsData = allDogs.map((dog) => {
      return {
        id: dog.id,
        name: dog.name,
        contentUrl: dog.fileUrl.length !== 0 ? JSON.parse(dog.fileUrl) : null,
        introduce: dog.introduce,
        species: dog.species,
        weight: dog.weight,
        birthday: dog.birthday,
        bringDate: dog.bringDate,
        representative: dog.representative,
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
          nickname: userData[0].nickname,
          contentUrl: JSON.parse(userData[0].fileUrl),
          introduce: userData[0].introduce,
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
    data,
  ) {
    const userData = await this.usersRepository.findOne({
      where: { nickname: nickname },
    });

    if (!userData) {
      throw new BadRequestException('존재하지 않는 유저입니다');
    }
    if (userId !== userData.id) {
      throw new UnauthorizedException('수정 권한이 없습니다');
    }

    const nicknameExist = await this.usersRepository.findOne({
      where: { nickname: data.userNickname },
    });

    if (nicknameExist && userData.nickname !== data.userNickname)
      throw new ConflictException('이미 존재하는 닉네임 입니다.');

    //s3에 새로운 프로필 이미지 저장
    const category = 'user';
    const newProfileImage = await this.awsService.fileUploads(files, category);

    const contentUrl = newProfileImage.map((v) => {
      return v.contentUrl;
    });

    //유저 정보 업데이트
    await this.usersRepository
      .createQueryBuilder()
      .update(Users)
      .set({
        nickname: data.userNickname,
        introduce: data.introduce,
        fileUrl: !files[0] ? userData.fileUrl : JSON.stringify(contentUrl),
      })
      .where('id=:userId', { userId: userId })
      .execute();

    return {
      nickname: data.userNickname,
      introduce: data.introduce,
      contentUrl: !files[0] ? JSON.parse(userData.fileUrl) : contentUrl,
    };
  }

  async updateDogProfile(
    id: number,
    userId: number,
    files: Array<Express.Multer.File>,
    data,
  ) {
    //강아지 정보 받아오고 에러처리
    const dogData = await this.dogsRepository.findOne({ where: { id: id } });

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

      this.dogsRepository
        .createQueryBuilder()
        .update(Dogs)
        .set({ representative: true })
        .where('id = :id', { id: id })
        .execute();
    }

    // s3에 새로운 강아지 프로필 이미지 저장
    const category = 'dog';
    const newDogImage = await this.awsService.fileUploads(files, category);

    const contentUrl = newDogImage.map((v) => {
      return v.contentUrl;
    });

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
        fileUrl: !files[0] ? dogData.fileUrl : JSON.stringify(contentUrl),
      })
      .where('id= :id', { id: id })
      .execute();

    return {
      name: data.name,
      introduce: data.introduce,
      representative: data.representative,
      species: data.species,
      weight: data.weight,
      birthday: data.birthday,
      bringDate: data.bringDate,
      contentUrl: !files[0] ? JSON.parse(dogData.fileUrl) : contentUrl,
    };
  }
}

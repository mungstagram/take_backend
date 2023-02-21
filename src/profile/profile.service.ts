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
import * as path from 'path';

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
      const daysWithin = Math.floor(
        (now.getTime() - dog.bringDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const ageYear = now.getFullYear() - dog.birthday.getFullYear();
      const ageMonth = now.getMonth() - dog.birthday.getMonth();
      const age =
        ageMonth < 0
          ? `${ageYear - 1}년 ${ageMonth + 12}개월`
          : `${ageYear}년 ${ageMonth}개월`;

      return {
        name: dog.name,
        // dog_image: dog.dog_image,
        daysWithin: daysWithin,
        age: age,
        species: dog.species,
        weight: dog.weight.toFixed(1),
        gender: dog.gender === true ? '수컷' : '암컷',
        introduce: dog.introduce,
        representative: dog.representative === true ? 1 : 0,
        birthday: dog.birthday,
      };
    });

    allDogsData.sort(
      (a, b) =>
        b.representative - a.representative ||
        a.birthday.getTime() - b.birthday.getTime(),
    );

    const data = [
      {
        user: {
          nickname: userData[0].nickname,
          // profile_image: userData[0].profile_image,
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
        name: dog.name,
        introduce: dog.introduce,
        species: dog.species,
        weight: dog.weight,
        birthday: dog.birthday,
        bringDate: dog.bringDate,
        representative: dog.representative === true ? 1 : 0,
      };
    });

    allDogsData.sort(
      (a, b) =>
        b.representative - a.representative ||
        a.birthday.getTime() - b.birthday.getTime(),
    );

    const data = {
      user: {
        nickname: userData[0].nickname,
        // profile_image: userData[0].profile_image,
        introduce: userData[0].introduce,
        dogsCount: allDogs.length,
      },
      dogs: allDogsData,
    };

    return data;
  }

  async updateUserProfile(
    nickname: string,
    userId: number,
    files: Array<Express.Multer.File>,
    data,
  ) {
    const userData = await this.usersRepository.findOne({
      where: { nickname: data.userNickname },
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
    const key = `${category}/${Date.now()}_${path.basename(
      files[0].originalname,
    )}`.replace(/ /g, '');

    try {
      this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: files[0].buffer,
          ACL: 'public-read',
          ContentType: files[0].mimetype,
        })
        .promise();
    } catch (err) {
      console.log(err);
    }

    const profile_image = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    //유저 정보 업데이트
    await this.usersRepository
      .createQueryBuilder()
      .update(Users)
      .set({
        nickname: data.userNickname,
        introduce: data.introduce,
        // profile_image: profile_image,
      })
      .where('id=:userId', { userId: userId })
      .execute();

    //S3에서 이전 이미지 삭제
    // const findKey = userData[0].profile_image.split('/')[4];
    // const keyInfo = `user/${findKey}`;

    // const params = {
    //   Bucket: process.env.AWS_S3_BUCKET_NAME,
    //   Key: keyInfo,
    // };

    // const s3 = this.awsS3;
    // s3.deleteObject(params, function (err, data) {
    //   if (err) {
    //   } else {
    //   }
    // });

    // return 'Updated';
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
    }

    if (files[0].buffer) {
      // files에 버퍼가 있는 경우 s3에 새로운 프로필 이미지 저장
      const category = 'dog';
      const key = `${category}/${Date.now()}_${path.basename(
        files[0].originalname,
      )}`.replace(/ /g, '');

      this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: files[0].buffer,
          ACL: 'public-read',
          ContentType: files[0].mimetype,
        })
        .promise();

      const profile_image = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    return dogData;
  }
}

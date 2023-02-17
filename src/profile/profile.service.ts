import { Dogs } from './../entities/Dogs';
import { Users } from './../entities/Users';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Dogs)
    private readonly dogsRepository: Repository<Dogs>,
  ) {}

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
        dog_image: dog.dog_image,
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
          profile_image: userData[0].profile_image,
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
        profile_image: userData[0].profile_image,
        introduce: userData[0].introduce,
        dogsCount: allDogs.length,
      },
      dogs: allDogsData,
    };

    return data;
  }
}

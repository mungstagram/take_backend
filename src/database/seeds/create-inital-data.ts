import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Comments } from '../../entities/Comments';
import { Logger } from '@nestjs/common';
import { CommentLikes } from '../../entities/CommentsLikes';
import { Dogs } from '../../entities/Dogs';
import { Files } from '../../entities/Files';
import { PostLikes } from '../../entities/PostLikes';
import { Posts } from '../../entities/Posts';
import { Users } from '../../entities/Users';
import { PostFiles } from '../../entities/PostFiles';

export default class Seeding implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManaget: SeederFactoryManager,
  ): Promise<any> {
    const logger = new Logger('Seed');
    // * Files
    const files = dataSource.getRepository(Files);
    await files.insert([
      {
        id: 1,
        contentUrl:
          'https://spartabecool.s3.amazonaws.com/image/1676984268618_image3.png',
        hash: 'a8cf3ae574b75e5fe0080953a11ee4055a409380c9041817355e95053417e462',
      },
      {
        id: 2,
        contentUrl:
          'https://spartabecool.s3.amazonaws.com/image/1676984268616_image1.png',
        hash: '8e8c4720667a4d80b9fa63e8c875cbcd8f64adb6ea4b55b428e7bebcde417978',
      },
      {
        id: 3,
        contentUrl:
          'https://spartabecool.s3.amazonaws.com/image/1676984268601_image2.png',
        hash: '9522115f20f8ec50c7a48985461a62f86fa076d21cca99dd93f2a6051030fee2',
      },
    ]);
    // * Users
    const users = dataSource.getRepository(Users);
    await users.insert([
      {
        //https://spartabecool.s3.amazonaws.com/image/1676984268618_image3.png
        id: 1,
        email: 'test@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder1',
        name: 'Seeder1',
        introduce: 'seed1 introduce',
        provider: 'local',
        FileId: 1,
      },
      {
        id: 2,
        email: 'test2@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder2',
        name: 'Seeder2',
        introduce: 'seed2 introduce',
        provider: 'kakao',
        FileId: 2,
      },
      {
        id: 3,
        email: 'test3@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder3',
        name: 'Seeder3',
        introduce: 'seed3 introduce',
        provider: 'google',
        FileId: 3,
      },
    ]);
    logger.log('User Seeding Complete');

    // * Posts
    const posts = dataSource.getRepository(Posts);
    await posts.insert([
      {
        id: 1,
        UserId: 1,
        title: 'Seeding 1_title',
        content: 'Seeding 1_content',
        category: 'image',
      },
      {
        id: 2,
        UserId: 2,
        title: 'Seeding 2_title',
        content: 'Seeding 2_content',
        category: 'image',
      },
      {
        id: 3,
        UserId: 3,
        title: 'Seeding 3_title',
        content: 'Seeding 3_content',
        category: 'image',
      },
    ]);
    logger.log('Posts Seeding Complete');

    // * Comments
    const comments = dataSource.getRepository(Comments);
    await comments.insert([
      {
        id: 1,
        target: 0,
        PostId: 1,
        UserId: 1,
        comment: 'Seeding 1',
      },
      {
        id: 2,
        target: 1,
        PostId: 2,
        UserId: 2,
        comment: 'Seeding 2',
      },
      {
        id: 3,
        target: 1,
        PostId: 3,
        UserId: 3,
        comment: 'Seeding 3',
      },
      {
        id: 4,
        target: 1,
        PostId: 1,
        UserId: 2,
        comment: 'Seeding 4',
      },
    ]);
    logger.log('Comments Seeding Complete');

    // * Dogs
    const dogs = dataSource.getRepository(Dogs);
    await dogs.insert([
      {
        id: 1,
        UserId: 1,
        name: '갱얼쥐1',
        species: '요크셔테리어',
        weight: 8,
        birthday: '2013-02-08',
        bringDate: '2013-06-08',
        representative: true,
        FileId: 1,
        introduce: '갱얼쥐1의 자기소개',
      },
      {
        id: 4,
        UserId: 1,
        name: '갱얼쥐1-1',
        species: '스피츠',
        weight: 9.5,
        birthday: '2019-04-08',
        bringDate: '2019-09-08',
        representative: false,
        FileId: 2,
        introduce: '갱얼쥐1-1의 자기소개',
      },
      {
        id: 2,
        UserId: 2,
        name: '갱얼쥐2',
        species: '진돗개',
        weight: 10.8,
        birthday: '2020-04-08',
        bringDate: '2020-08-08',
        representative: true,
        FileId: 3,
        introduce: '갱얼쥐2의 자기소개',
      },
      {
        id: 3,
        UserId: 3,
        name: '갱얼쥐3',
        species: '푸들',
        weight: 10.8,
        birthday: '2021-02-08',
        bringDate: '2021-03-08',
        representative: true,
        FileId: 1,
        introduce: '갱얼쥐3의 자기소개',
      },
    ]);
    logger.log('Dogs Seeding Complete');

    //* PostLikes
    const postLikes = dataSource.getRepository(PostLikes);
    await postLikes.insert([
      {
        id: 1,
        UserId: 1,
        PostId: 1,
      },
      {
        id: 2,
        UserId: 1,
        PostId: 2,
      },
      {
        id: 3,
        UserId: 1,
        PostId: 3,
      },
      {
        id: 4,
        UserId: 2,
        PostId: 1,
      },
      {
        id: 5,
        UserId: 2,
        PostId: 3,
      },
      {
        id: 6,
        UserId: 3,
        PostId: 1,
      },
    ]);
    logger.log('PostLikes Seeding Complete');

    // * CommentLikes
    const commentLikes = dataSource.getRepository(CommentLikes);
    await commentLikes.insert([
      {
        id: 1,
        UserId: 1,
        CommentId: 1,
      },
      {
        id: 2,
        UserId: 1,
        CommentId: 2,
      },
      {
        id: 3,
        UserId: 1,
        CommentId: 3,
      },
      {
        id: 4,
        UserId: 2,
        CommentId: 1,
      },
      {
        id: 5,
        UserId: 2,
        CommentId: 3,
      },
      {
        id: 6,
        UserId: 3,
        CommentId: 1,
      },
    ]);
    logger.log('CommentLikes Seeding Complete');

    const postFiles = dataSource.getRepository(PostFiles);
    await postFiles.insert([
      {
        PostId: 1,
        FileId: 1,
      },
      {
        PostId: 1,
        FileId: 2,
      },
      {
        PostId: 1,
        FileId: 3,
      },
      {
        PostId: 2,
        FileId: 1,
      },
      {
        PostId: 2,
        FileId: 2,
      },
      {
        PostId: 2,
        FileId: 3,
      },
      {
        PostId: 3,
        FileId: 1,
      },
      {
        PostId: 3,
        FileId: 3,
      },
      {
        PostId: 3,
        FileId: 2,
      },
    ]);
  }
}

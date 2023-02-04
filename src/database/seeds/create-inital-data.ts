import { PostLikes } from './../../entities/PostLikes';
import { Dogs } from '../../entities/Dogs';
import { Users } from '../../entities/Users';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Posts } from '../../entities/Posts';
import { Comments } from '../../entities/Comments';
import { Logger } from '@nestjs/common';
import { CommentLikes } from '../../entities/CommentsLikes';

export default class Seeding implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManaget: SeederFactoryManager,
  ): Promise<any> {
    const logger = new Logger('Seed');
    // * Users
    const users = dataSource.getRepository(Users);
    await users.insert([
      {
        id: 1,
        email: 'test@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder1',
        name: 'Seeder1',
        profile_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
      },
      {
        id: 2,
        email: 'test2@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder2',
        name: 'Seeder2',
        profile_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
      },
      {
        id: 3,
        email: 'test3@test.com',
        password:
          '$2b$10$6XILag0LyymJQOFU3rgvl.KYJ.UcXMuQxBIWQoSzl16vwI2mjOryC',
        nickname: 'Seeder3',
        name: 'Seeder3',
        profile_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
      },
    ]);
    logger.log('User Seeding Complete');

    // * Posts
    const posts = dataSource.getRepository(Posts);
    await posts.insert([
      {
        id: 1,
        UserId: 1,
        content: 'Seeding 1',
        content_url:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
      },
      {
        id: 2,
        UserId: 2,
        content: 'Seeding 2',
        content_url:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
      },
      {
        id: 3,
        UserId: 3,
        content: 'Seeding 3',
        content_url:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPSldd1PwjMz6j7xbiy2UATRPqGGgTf3oCc1z9zWuvVQ&s',
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
    ]);
    logger.log('Comments Seeding Complete');

    // * Dogs
    const dogs = dataSource.getRepository(Dogs);
    await dogs.insert([
      {
        id: 1,
        UserId: 1,
        name: '갱얼쥐1',
        gender: true,
        photos:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fko%2Fphotos%2Fsearch%2F%25EC%2595%25A0%25EA%25B2%25AC%2F&psig=AOvVaw2_FcU4LAgQiQCAUgaaqtHb&ust=1675620320391000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCIDBlaG6_PwCFQAAAAAdAAAAABAE',
      },
      {
        id: 4,
        UserId: 1,
        name: '갱얼쥐1-1',
        gender: true,
        photos:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shutterstock.com%2Fko%2Fsearch%2F%25EA%25B0%2595%25EC%2595%2584%25EC%25A7%2580&psig=AOvVaw2_FcU4LAgQiQCAUgaaqtHb&ust=1675620320391000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCIDBlaG6_PwCFQAAAAAdAAAAABAw',
      },
      {
        id: 2,
        UserId: 2,
        name: '갱얼쥐2',
        gender: true,
        photos:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fkr.freepik.com%2Fphotos%2F%25EA%25B0%2595%25EC%2595%2584%25EC%25A7%2580&psig=AOvVaw2_FcU4LAgQiQCAUgaaqtHb&ust=1675620320391000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCIDBlaG6_PwCFQAAAAAdAAAAABAY',
      },
      {
        id: 3,
        UserId: 3,
        name: '갱얼쥐3',
        gender: true,
        photos:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fko-kr%2Fsearch%2F%25EA%25B0%2595%25EC%2595%2584%25EC%25A7%2580%2F&psig=AOvVaw2_FcU4LAgQiQCAUgaaqtHb&ust=1675620320391000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCIDBlaG6_PwCFQAAAAAdAAAAABAo',
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
  }
}

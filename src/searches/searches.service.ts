import { timeGap } from '../helper/timegap.helper';
import { Posts } from './../entities/Posts';
import { Users } from '../entities/Users';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SearchesService {
  constructor(
    @InjectRepository(Users, 'postgresql')
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Posts, 'postgresql')
    private readonly postsRepository: Repository<Posts>,
  ) {}
  async search(query: { category: string; search: string }, userId) {
    if (!query.category || !query.search) {
      throw new BadRequestException('요청에 실패했습니다.');
    }

    const keyword = query.search.replace(/\s/g, '');

    console.log(keyword);
    console.log(query.search);
    console.log(`%${query.search}%`);

    if (query.category === 'users') {
      const searchedData = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.nickname', 'u.introduce', 'uf.contentUrl'])
        .where('u.nickname LIKE :nickname', { nickname: `%${query.search}%` })
        .leftJoin('u.File', 'uf')
        .getMany();

      const data = searchedData.map((user) => {
        return {
          userId: user.id,
          nickname: user.nickname,
          introduce: user.introduce ? user.introduce : '',
          contentUrl: user.File ? user.File['contentUrl'] : null,
        };
      });

      return data;
    } else if (query.category === 'image' || query.category === 'video') {
      const searchedData = await this.postsRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.title',
          'p.content',
          'p.category',
          'u.nickname',
          'p.createdAt',
          'pl',
          'f.contentUrl',
          'uf.contentUrl',
        ])
        .leftJoin('p.User', 'u')
        .leftJoin('u.File', 'uf')
        .leftJoin('p.PostLikes', 'pl')
        .leftJoinAndSelect('p.PostFiles', 'pf')
        .leftJoin('pf.File', 'f')
        .loadRelationCountAndMap('p.likesCount', 'p.PostLikes')
        .loadRelationCountAndMap('p.commentsCount', 'p.Comments')
        .where('REPLACE(p.title, :space, :empty) LIKE :keyword', {
          space: ' ',
          empty: '',
          keyword: `%${keyword}%`,
        })
        .andWhere('p.category = :category', { category: query.category })
        .orderBy('p.createdAt', 'DESC')
        .getMany();

      const data = await Promise.all(
        searchedData.map(async (post) => {
          const isLiked = post.PostLikes.filter((v) => {
            if (v.UserId === userId) return v;
          });

          const newTimeGap = timeGap(post.createdAt);

          const contentUrl = post['PostFiles'].map(
            (v) => v['File']['contentUrl'],
          );

          return {
            postId: post.id,
            nickname: post.User.nickname,
            profileUrl: post.User.File['contentUrl'],
            title: post.title,
            content: post.content,
            contentUrl: contentUrl,
            category: post.category,
            commentCount: post['commentsCount'],
            likesCount: post['likesCount'],
            createdAt: newTimeGap,
            isLiked: isLiked.length !== 0 ? true : false,
          };
        }),
      );

      return data;
    } else {
      throw new BadRequestException('요청에 실패했습니다.');
    }
  }
}

import { FileUrlService } from './../../helper/get.file.url.helper';
import { UploadFiles } from './../../models/UploadFiles';
import { AWSService } from './../../helper/fileupload.helper';
import { JwtPayload } from './../../auth/jwt/jwt.payload.dto';
import { Comments } from './../../entities/Comments';
import { PostLikes } from './../../entities/PostLikes';
import { CommentLikes } from './../../entities/CommentsLikes';
import { Posts } from './../../entities/Posts';

import { ConfigService } from '@nestjs/config';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { timeGap } from 'src/helper/timegap.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  //의존성 주입
  constructor(
    @InjectRepository(CommentLikes)
    private readonly commentLikesRepository: Repository<CommentLikes>,
    @InjectRepository(Comments)
    private readonly commentsRepository: Repository<Comments>,
    @InjectRepository(PostLikes)
    private readonly postLikesRepository: Repository<PostLikes>,
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    @InjectModel(UploadFiles.name)
    private readonly uploadFilesModel: Model<UploadFiles>,
    private readonly configService: ConfigService,
    private readonly awsService: AWSService,
    private readonly fileUrlService: FileUrlService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  //게시글 작성
  async createPosts(
    data: PostsCreateRequestsDto,
    files: Array<Express.Multer.File>,
    payload: JwtPayload,
  ) {
    const { title, content, category } = data;
    const UserId = payload.sub;

    if (Object.keys(files).length === 0) {
      throw new BadRequestException('files should not be empty');
    }

    try {
      //file 별로 구분하여 s3에 저장
      const images = await this.awsService.fileUploads(files, category);

      const fileId = images.map((v) => {
        return v.id;
      });

      const contentUrl = images.map((v) => {
        return v.contentUrl;
      });

      //DB에 내용 데이터와 S3에 저장된 이미지 및 영상 데이터 URL 저장
      await this.postsRepository.save({
        title,
        content,
        fileId: JSON.stringify(fileId),
        category,
        UserId,
      });

      return {
        title,
        content,
        contentUrl,
        category,
        UserId,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //게시글 전체 조회
  async getAllPosts(
    payload: JwtPayload,
    query: { category: string; order: string; nickname?: string },
  ) {
    const userId = payload.sub;
    const { category, order, nickname } = query;
    const arrayWay =
      order === 'recent'
        ? 'p.createdAt'
        : order === 'likescount'
        ? 'likescount'
        : false;

    if (!arrayWay) {
      throw new BadRequestException('잘못된 접근입니다.');
    }

    const nickExist = nickname
      ? {
          condition: 'u.nickname= :nickname',
          conditionDetail: { nickname: nickname },
        }
      : { condition: 'p.deletedAt is null' };

    const allPosts = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.content',
        'p.fileUrl',
        'p.category',
        'u.nickname',
        'p.createdAt',
        'pl2.UserId',
      ])
      .leftJoin('p.User', 'u')
      .leftJoin('p.Comments', 'c')
      .leftJoin('p.PostLikes', 'pl')
      .leftJoin('p.PostLikes', 'pl2')
      .loadRelationCountAndMap('p.Comments', 'p.Comments')
      .loadRelationCountAndMap('pl', 'p.PostLikes', 'plCount')
      .where('p.category = :category', { category: category })
      .andWhere(nickExist.condition, nickExist.conditionDetail)
      .orderBy('p.createdAt', 'DESC')
      .getMany();

    const data = await Promise.all(
      allPosts.map(async (post) => {
        const isLiked = post.PostLikes.filter((v) => {
          if (v.UserId === userId) return v;
        });

        const newTimeGap = timeGap(post.createdAt);

        return {
          postid: post.id,
          nickname: post.User.nickname,
          title: post.title,
          content: post.content,
          contentUrl: JSON.parse(post.fileUrl),
          category: post.category,
          commentCount: post.Comments,
          likesCount: post['undefined'], // 이거 언디파인드로 나오는거 어케 살리지
          createdAt: newTimeGap,
          isLiked: isLiked.length !== 0 ? true : false,
        };
      }),
    );

    if (order === 'likescount') {
      data.sort((a, b) => {
        if (
          typeof a.likesCount === 'number' &&
          typeof b.likesCount === 'number'
        ) {
          return b.likesCount - a.likesCount;
        }
      });
    }

    return data;
  }

  //게시물 상세조회
  async getOnePost(postId: number, payload: JwtPayload) {
    try {
      const userId = payload.sub;

      const onePost = await this.postsRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'p.title',
          'p.content',
          'p.fileUrl',
          'p.category',
          'u.nickname',
          'p.createdAt',
          'pl',
        ])
        .leftJoin('p.User', 'u')
        .leftJoinAndSelect('p.Comments', 'c')
        .leftJoin('p.PostLikes', 'pl')
        .loadRelationCountAndMap('p.PostLikes', 'p.PostLikes')
        .where('c.PostId=:postId', { postId: postId })
        .getOne();

      const newTimeGap = timeGap(onePost.createdAt);

      const isLikedPost = await this.postLikesRepository.findBy({
        PostId: postId,
        UserId: userId,
      });

      const sortedComments = onePost.Comments.sort((a, b) => {
        if (
          typeof a.createdAt.getTime() === 'number' &&
          typeof b.createdAt.getTime() === 'number'
        ) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
      }).map((comment) => {
        return {
          id: comment.id,
          comment: comment.comment,
          userId: comment.UserId,
          createdAt: timeGap(comment.createdAt),
        };
      });

      return {
        postid: onePost.id,
        nickname: onePost.User.nickname,
        title: onePost.title,
        content: onePost.content,
        contentUrl: JSON.parse(onePost.fileUrl),
        category: onePost.category,
        comments: sortedComments,
        likesCount: onePost.PostLikes,
        createdAt: newTimeGap,
        isLiked: isLikedPost[0] ? true : false,
        commentsCount: onePost.Comments.length,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //게시물 수정
  async updatePost(
    postId: number,
    data: PostsCreateRequestsDto,
    payload: JwtPayload,
    files: Array<Express.Multer.File>,
  ) {
    const { title, content, category } = data;

    const userId = payload.sub;

    const images = await this.awsService.fileUploads(files, category);

    const contentUrl = images.map((v) => {
      return v.contentUrl;
    });

    await this.postsRepository
      .createQueryBuilder()
      .update(Posts)
      .set({
        title: title,
        content: content,
        fileUrl: JSON.stringify(contentUrl),
        category: category,
      })
      .where('id=:id', { id: postId })
      .andWhere('UserId=:UserId', { UserId: userId })
      .execute();

    return {
      title,
      content,
      contentUrl,
      category,
    };
  }

  //삭제 기능 service
  async deletePost(postId: number, payload: JwtPayload) {
    const userId = payload.sub;

    //DB에서 논리적 삭제
    await this.postsRepository.softDelete({
      id: postId,
      UserId: userId,
    });

    return 'Deleted';
  }

  //좋아요 기능 service
  async postLikes(postId: number, payload: JwtPayload) {
    const userId = payload.sub;

    const existPostLikes = await this.postLikesRepository.findBy({
      PostId: postId,
      UserId: userId,
    });

    if (!existPostLikes[0]) {
      await this.postLikesRepository.save({ PostId: postId, UserId: userId });

      return 'success makes likes';
    } else {
      await this.postLikesRepository.delete({ PostId: postId, UserId: userId });

      return 'success cancel likes';
    }
  }
}

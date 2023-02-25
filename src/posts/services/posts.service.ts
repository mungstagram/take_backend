import { Files } from 'src/entities/Files';
import { AWSService } from './../../helper/fileupload.helper';
import { JwtPayload } from './../../auth/jwt/jwt.payload.dto';
import { PostLikes } from '../../entities/PostLikes';
import { Posts } from '../../entities/Posts';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { timeGap } from 'src/helper/timegap.helper';
import { PostFiles } from '../../entities/PostFiles';

@Injectable()
export class PostsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  //의존성 주입
  constructor(
    @InjectRepository(PostLikes, 'postgresql')
    private readonly postLikesRepository: Repository<PostLikes>,
    @InjectRepository(Posts, 'postgresql')
    private readonly postsRepository: Repository<Posts>,
    @InjectRepository(PostFiles, 'postgresql')
    private readonly postFilesReposirory: Repository<PostFiles>,
    private readonly awsService: AWSService,
  ) {}

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

    // const queryRunner = this.dataSource.createQueryRunner();

    // await queryRunner.startTransaction();

    try {
      //file 별로 구분하여 s3에 저장
      const filesData = await this.awsService.fileUploads(files, category);

      //DB에 내용 데이터와 S3에 저장된 이미지 및 영상 데이터 URL 저장
      const postData = await this.postsRepository.insert({
        title,
        content,
        category,
        UserId,
      });

      const insertPostFilesData = filesData.map((v) => {
        const postFiles = new PostFiles();
        postFiles.PostId = postData.identifiers[0].id;
        postFiles.FileId = v.id;

        return postFiles;
      });

      await this.postFilesReposirory.insert(insertPostFilesData);

      const contentUrl = filesData.map((v) => {
        return v.contentUrl;
      });

      // await queryRunner.commitTransaction();

      return {
        id: postData.identifiers[0].id,
        title,
        content,
        contentUrl,
        category,
        UserId,
      };
    } catch (error) {
      // await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      // await queryRunner.release();
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
        'p.category',
        'u.nickname',
        'p.createdAt',
        'pl',
        'f.contentUrl',
      ])
      .leftJoin('p.User', 'u')
      .leftJoin('p.PostLikes', 'pl')
      .leftJoinAndSelect('p.PostFiles', 'pf')
      .leftJoin('pf.File', 'f')
      .loadRelationCountAndMap('p.commentsCount', 'p.Comments')
      .loadRelationCountAndMap('p.likesCount', 'p.PostLikes')
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

        const contentUrl = post['PostFiles'].map(
          (v) => v['File']['contentUrl'],
        );

        return {
          postId: post.id,
          nickname: post.User.nickname,
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
          'p.category',
          'u.nickname',
          'p.createdAt',
          'pl',
          'f.contentUrl',
        ])
        .leftJoin('p.User', 'u')
        .leftJoinAndSelect('p.PostFiles', 'pf')
        .leftJoin('pf.File', 'f')
        .leftJoinAndSelect('p.Comments', 'c')
        .leftJoin('p.PostLikes', 'pl')
        .loadRelationCountAndMap('p.PostLikes', 'p.PostLikes')
        .where('p.id=:postId', { postId: postId })
        .getOne();

      const newTimeGap = timeGap(onePost.createdAt);

      const isLikedPost = await this.postLikesRepository.findBy({
        PostId: postId,
        UserId: userId,
      });

      const contentUrl = onePost['PostFiles'].map(
        (v) => v['File']['contentUrl'],
      );

      const sortedComments = onePost.Comments?.sort((a, b) => {
        if (onePost.Comments.length === 0) {
          return 0;
        }
        if (
          typeof a.createdAt.getTime() === 'number' &&
          typeof b.createdAt.getTime() === 'number'
        ) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
      })?.map((comment) => {
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
        contentUrl: contentUrl,
        category: onePost.category,
        likesCount: onePost.PostLikes,
        createdAt: newTimeGap,
        isLiked: isLikedPost[0] ? true : false,
        commentsCount: onePost.Comments.length,
        comments: sortedComments,
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

    const postData = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!postData)
      throw new BadRequestException('존재하지 않는 게시글 입니다.');

    if (postData.UserId === userId)
      throw new ForbiddenException('본인의 게시글만 수정 가능합니다');

    const filesData = await this.awsService.fileUploads(files, category);
    const contentUrl = filesData.map((v) => {
      return v.contentUrl;
    });

    // const queryRunnder = this.dataSource.createQueryRunner();
    // await queryRunnder.startTransaction();
    try {
      const findContentId = await this.postFilesReposirory.find({
        where: { PostId: postId },
      });

      const postFilesIds = findContentId.map((v) => v.id);

      await this.postFilesReposirory.delete(postFilesIds);
      const insertPostFilesData = filesData.map((v) => {
        const mapData = new PostFiles();
        mapData.PostId = postId;
        mapData.FileId = v.id;

        return mapData;
      });

      await this.postFilesReposirory.insert(insertPostFilesData);

      await this.postsRepository
        .createQueryBuilder()
        .update(Posts)
        .set({
          title: title,
          content: content,
          category: category,
        })
        .where('id=:id', { id: postId })
        .andWhere('UserId=:UserId', { UserId: userId })
        .execute();

      // await queryRunnder.commitTransaction();

      return {
        title,
        content,
        contentUrl,
        category,
      };
    } catch (error) {
      // await queryRunnder.rollbackTransaction();
      throw new Error(error.message);
    } finally {
      // await queryRunnder.release();
    }
  }

  //삭제 기능 service
  async deletePost(postId: number, payload: JwtPayload) {
    const userId = payload.sub;

    const postData = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!postData)
      throw new BadRequestException('존재하지 않는 게시글 입니다.');

    if (!(postData.UserId === userId))
      throw new ForbiddenException('본인의 게시글만 삭제 가능합니다.');

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
      await this.postLikesRepository.insert({ PostId: postId, UserId: userId });

      return 'success makes likes';
    } else {
      await this.postLikesRepository.delete({ PostId: postId, UserId: userId });

      return 'success cancel likes';
    }
  }
}

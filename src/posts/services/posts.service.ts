import { Comments } from './../../entities/Comments';
import { PostLikes } from './../../entities/PostLikes';

import { ConfigService } from '@nestjs/config';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/entities/Posts';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import { CommentLikes } from 'src/entities/CommentsLikes';

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
    private readonly configService: ConfigService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  //게시글 작성 서비스
  async createPosts(
    data: PostsCreateRequestsDto,
    folder: string,
    files: Array<Express.Multer.File>,
    payload,
  ) {
    const { title, content, category } = data;
    const UserId = payload.sub;
    let result = '';

    //file 별로 구분하여 s3에 저장
    files.forEach((file) => {
      const key = `${folder}/${Date.now()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, '');

      this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();
      const content_url = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

      result += content_url;
      result += ',';
    });

    result = result.slice(0, -1);

    //DB에 내용 데이터와 S3에 저장된 이미지 및 영상 데이터 URL 저장
    const post = await this.postsRepository.save({
      title,
      content,
      content_url: result,
      category,
      UserId,
    });

    return post;
  }

  //게시글 전체 조회
  async getAllPosts(payload) {
    const userId = payload.sub;

    const now = new Date();

    const allPosts = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.content',
        'p.content_url',
        'p.category',
        'u.nickname',
        'pl',
        'p.createdAt',
      ])
      .leftJoin('p.User', 'u')
      .leftJoin('p.CommentsCount', 'c')
      .loadRelationCountAndMap('p.CommentsCount', 'p.Comments')
      .leftJoin('p.PostLikes', 'pl')
      .loadRelationCountAndMap('p.PostLikes', 'p.PostLikes')
      .getMany();

    const data = await Promise.all(
      allPosts.map(async (post) => {
        const isLikedPost = await this.postLikesRepository.findBy({
          PostId: post.id,
          UserId: userId,
        });

        const createdTime = new Date(post.createdAt);
        const timeGap = now.getTime() - createdTime.getTime();

        let newTimeGap = '';

        if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7 * 4)) !== 0) {
          newTimeGap = `${createdTime.getMonth()}월 ${createdTime.getDate()}일`;
        } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7)) !== 0) {
          newTimeGap = `${Math.floor(
            timeGap / (1000 * 60 * 60 * 24 * 7),
          )}주 전`;
        } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24)) !== 0) {
          newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60 * 24))}일 전`;
        } else if (Math.floor(timeGap / (1000 * 60 * 60)) !== 0) {
          newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60))}시간 전`;
        } else if (Math.floor(timeGap / (1000 * 60)) !== 0) {
          newTimeGap = `${Math.floor(timeGap / (1000 * 60))}분 전`;
        } else {
          newTimeGap = `방금전`;
        }

        return {
          postid: post.id,
          nickname: post.User.nickname,
          title: post.title,
          content: post.content,
          content_url: post.content_url.split(','),
          category: post.category,
          commentCount: post.Comments,
          likesCount: post.PostLikes,
          createdAt: newTimeGap,
          isLiked: isLikedPost[0] ? true : false,
        };
      }),
    );

    return data;
  }

  //
  async getOnePost(postId, payload) {
    const userId = payload.sub;

    function timeGapCalculator(createTime: Date) {
      const now = new Date();
      const createdTime = new Date(createTime);
      const timeGap = now.getTime() - createdTime.getTime();
      let newTimeGap = '';

      if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7 * 4)) !== 0) {
        newTimeGap = `${createdTime.getMonth()}월 ${createdTime.getDate()}일`;
      } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7)) !== 0) {
        newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7))}주 전`;
      } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24)) !== 0) {
        newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60 * 24))}일 전`;
      } else if (Math.floor(timeGap / (1000 * 60 * 60)) !== 0) {
        newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60))}시간 전`;
      } else if (Math.floor(timeGap / (1000 * 60)) !== 0) {
        newTimeGap = `${Math.floor(timeGap / (1000 * 60))}분 전`;
      } else {
        newTimeGap = `방금전`;
      }

      return newTimeGap;
    }

    const postComments = await this.commentsRepository
      .createQueryBuilder('c')
      .select(['c.id', 'c.comment', 'u.nickname', 'c.createdAt'])
      .leftJoin('c.User', 'u')
      .leftJoin('c.CommentLikes', 'cl')
      .loadRelationCountAndMap('c.CommentLikes', 'c.CommentLikes')
      .where('c.PostId=:postId', { postId: postId })
      .getMany();

    const allComments = await Promise.all(
      postComments.map(async (comment) => {
        const isLikedComment = await this.commentLikesRepository.findBy({
          CommentId: comment.id,
        });
        return {
          commentId: comment.id,
          comment: comment.comment,
          nickname: comment.User.nickname,
          likesCount: comment.CommentLikes,
          createdAt: timeGapCalculator(comment.createdAt),
          isLiked: isLikedComment[0] ? true : false,
        };
      }),
    );

    const isLikedPost = await this.postLikesRepository.findBy({
      PostId: postId,
      UserId: userId,
    });

    const onePost = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.content',
        'p.content_url',
        'p.category',
        'u.nickname',
        'p.createdAt',
        'c',
      ])
      .leftJoin('p.User', 'u')
      .leftJoin('p.Comments', 'c')
      .loadRelationCountAndMap('p.Comments', 'p.Comments')
      .leftJoin('p.PostLikes', 'pl')
      .loadRelationCountAndMap('p.PostLikes', 'p.PostLikes')
      .where('p.id=:postId', { postId: postId })
      .getOne();

    return {
      postId: onePost.id,
      title: onePost.title,
      nickname: onePost.User.nickname,
      content: onePost.content,
      content_url: onePost.content_url,
      comment: allComments,
      commentCount: onePost.Comments,
      likesCount: onePost.PostLikes,
      isLikedPost: isLikedPost[0] ? true : false,
      createdAt: timeGapCalculator(onePost.createdAt),
    };
  }

  async updatePost(
    postId: number,
    data: PostsCreateRequestsDto,
    folder: string,
    payload,
    files: Array<Express.Multer.File>,
  ) {
    const { title, content, category } = data;

    const userId = payload.sub;
    let result = '';

    // //기존에 있던 이미지나 영상 파일 S3에서 삭제

    // const findPost = await this.postsRepository.findBy({ id: postId });

    // const postContent_url = await findPost[0].content_url.split(',');

    // await Promise.all(
    //   postContent_url.map(async (content_url) => {
    //     const findKey = content_url.split('/')[4];
    //     const keyInfo = `project/${findKey}`;

    //     console.log(findKey);

    //     const params = {
    //       Bucket: process.env.AWS_S3_BUCKET_NAME,
    //       Key: keyInfo,
    //     };

    //     const s3 = this.awsS3;
    //     s3.deleteObject(params, function (err, data) {
    //       if (err) {
    //       } else {
    //         console.log('삭제성공');
    //       }
    //     });
    //   }),
    // );

    //file 별로 구분하여 s3에 저장
    files.forEach((file) => {
      const key = `${folder}/${Date.now()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, '');

      this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();
      const content_url = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

      result += content_url;
      result += ',';
    });

    result = result.slice(0, -1);

    const updatedPost = await this.postsRepository
      .createQueryBuilder()
      .update(Posts)
      .set({
        title: title,
        content: content,
        content_url: result,
        category: category,
      })
      .where('id=:id', { id: postId })
      .andWhere('UserId=:UserId', { UserId: userId })
      .execute();

    return updatedPost;
  }
}

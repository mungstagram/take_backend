import { PostLikes } from './../../entities/PostLikes';
import { Users } from './../../entities/Users';
import { ConfigService } from '@nestjs/config';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/entities/Posts';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import { type } from 'os';

@Injectable()
export class PostsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  //의존성 주입
  constructor(
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
  ) {
    const { content, hashTags, UserId } = data;
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

    console.log(hashTags);

    //DB에 내용 데이터와 S3에 저장된 이미지 및 영상 데이터 URL 저장
    const post = await this.postsRepository.save({
      content,
      content_url: result,
      hashTags,
      UserId,
    });

    return post;
  }

  //게시글 전체 조회
  async getAllPosts(body) {
    const { userId } = body;

    const now = new Date();

    const allPosts = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.content',
        'p.content_url',
        'u.nickname',
        'pl',
        'p.createdAt',
      ])
      .leftJoin('p.User', 'u')
      .leftJoin('p.Comments', 'c')
      .loadRelationCountAndMap('p.Comments', 'p.Comments')
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
          content: post.content,
          contentUrl: post.content_url.split(','),
          hashTags: post.hashtag,
          commentCount: post.Comments,
          likesCount: post.PostLikes,
          createdAt: newTimeGap,
          isLiked: isLikedPost[0] ? true : false,
        };
      }),
    );

    return data;
  }
  //postId, nickname, content, contentUrl, createdAt, commentCount, , likesCount, isLiked
}

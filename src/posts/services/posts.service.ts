import { ConfigService } from '@nestjs/config';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../../entities/Posts';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';

@Injectable()
export class PostsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  //의존성 주입
  constructor(
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

    //DB에 내용 데이터와 S3에 저장된 이미지 및 영상 데이터 URL 저장
    const post = await this.postsRepository.save({
      content,
      content_url: result,
      hashTags,
      UserId,
    });

    return post;
  }
}

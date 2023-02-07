import { ConfigService } from '@nestjs/config';
import { PostsCreateRequestsDto } from './../dto/postscreate.request.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from 'src/entities/Posts';
import { DataSource, Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as path from 'path';

@Injectable()
export class PostsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

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

  async createPosts(
    data: PostsCreateRequestsDto,
    folder: string,
    file: Express.Multer.File,
  ) {
    const { content, hashTags, UserId } = data;

    const key = `${folder}/${Date.now()}_${path.basename(
      file.originalname,
    )}`.replace(/ /g, '');

    const s3Object = await this.awsS3
      .putObject({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      })
      .promise();

    const content_url = `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    const post = await this.postsRepository.save({
      content,
      content_url,
      hashTags,
      UserId,
    });

    return post;
  }

  // async uploadImg(
  //   folder: string,
  //   file: Express.Multer.File,
  // ): Promise<{
  //   imgurl: string;
  // }> {
  //   try {
  //     const key = `${folder}/${Date.now()}_${path.basename(
  //       file.originalname,
  //     )}`.replace(/ /g, '');

  //     const s3Object = await this.awsS3
  //       .putObject({
  //         Bucket: this.S3_BUCKET_NAME,
  //         Key: key,
  //         Body: file.buffer,
  //         ACL: 'public-read',
  //         ContentType: file.mimetype,
  //       })
  //       .promise();
  //     return {
  //       imgurl: `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

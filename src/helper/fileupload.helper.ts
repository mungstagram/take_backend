import { Files } from '../entities/Files';
import { BadRequestException } from '@nestjs/common';

import * as path from 'path';
import * as AWS from 'aws-sdk';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class AWSService {
  constructor(
    @InjectRepository(Files, 'postgresql')
    private readonly filesRespository: Repository<Files>,
  ) {}

  async fileUploads(files: Array<Express.Multer.File>, category: string) {
    const awsS3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      region: process.env.AWS_S3_REGION,
    });

    if (!files[0]) {
      throw new BadRequestException('업로드할 이미지가 없습니다.');
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const hashSum = createHash('sha256');
        hashSum.update(file.buffer);
        const hex = hashSum.digest('hex');

        const hashCheck = await this.filesRespository.findOne({
          where: { hash: hex },
        });

        if (hashCheck) {
          return hashCheck;
        }

        const key = `${category}/${Date.now()}_${path.basename(
          Buffer.from(file.originalname, 'latin1').toString('utf8'),
        )}`.replace(/ /g, '');

        const content_url = `https://dpvqqhfbpe28l.cloudfront.net/${key}`;

        await awsS3
          .putObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
          })
          .promise();

        if (content_url.length === 0) {
          throw new BadRequestException('file uploads failed');
        }

        const insertFiles = await this.filesRespository.insert({
          contentUrl: content_url,
          hash: hex,
        });

        const uploadedFiles = await this.filesRespository.findOne({
          where: { id: insertFiles.identifiers[0].id },
        });

        return uploadedFiles;
      }),
    );

    return result.map((v) => {
      return { id: v.id, contentUrl: v.contentUrl };
    });
  }
}

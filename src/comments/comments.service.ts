import { timeGap } from '../helper/timegap.helper';
import { Files } from './../entities/Files';
import { CommentDeleteRequestDto } from './dtos/comment.delete.dto';
import { UsersService } from './../users/users.service';
import { CommentCreateRequestDto } from './dtos/comment.create.request.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comments } from '../entities/Comments';
import { Repository } from 'typeorm';
import { CommentUpdateRequestDto } from './dtos/comment.update.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Files, 'postgresql')
    private readonly filesRepository: Repository<Files>,
    @InjectRepository(Comments, 'postgresql')
    private readonly commentsRepository: Repository<Comments>,
    private readonly usersService: UsersService,
  ) {}

  async createComment(commentCreateRequestDto: CommentCreateRequestDto) {
    const comment = await this.commentsRepository.save({
      ...commentCreateRequestDto,
    });

    const user = await this.usersService.findById(
      commentCreateRequestDto.UserId,
    );

    const profileImage = await this.filesRepository.findOne({
      where: { id: user.FileId },
    });

    return {
      id: comment.id,
      userId: user.id,
      comment: comment.comment,
      nickname: user.nickname,
      profileUrl: profileImage.contentUrl,
      createAt: timeGap(comment.createdAt),
    };
  }

  async updateComment(commentUpdateRequestDto: CommentUpdateRequestDto) {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id',
        'c.UserId',
        'c.target',
        'c.comment',
        'c.createdAt',
        'c.updatedAt',
        'u.nickname',
      ])
      .leftJoin('c.User', 'u')
      .where('c.id = :id', { id: commentUpdateRequestDto.id })
      .andWhere('u.id = :UserId', { UserId: commentUpdateRequestDto.UserId })
      .getOne();

    if (!comment)
      throw new UnauthorizedException(
        '존재하지 않는 댓글이거나 권한이 없습니다.',
      );

    await this.commentsRepository.update(commentUpdateRequestDto.id, {
      comment: commentUpdateRequestDto.comment,
    });

    const commentData = { ...comment, myComment: true };

    return commentData;
  }

  async deleteComment(commentDeleteRequestDto: CommentDeleteRequestDto) {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .select(['c.id', 'u.id'])
      .leftJoin('c.User', 'u')
      .where('c.id = :id', { id: commentDeleteRequestDto.id })
      .andWhere('u.id = :UserId', { UserId: commentDeleteRequestDto.UserId })
      .getOne();

    if (!comment)
      throw new UnauthorizedException(
        '존재하지 않는 댓글이거나 권한이 없습니다.',
      );

    await this.commentsRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id: commentDeleteRequestDto.id })
      .execute();

    return;
  }
}

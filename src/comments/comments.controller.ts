import { CommentDeleteRequestDto } from './dtos/comment.delete.dto';
import { CommentCreateRequestDto } from './dtos/comment.create.request.dto';
import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPayload } from '../common/dacorators/get.payload.decorator';
import { CommentUpdateRequestDto } from './dtos/comment.update.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '댓글 작성 API' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  @HttpCode(201)
  async createComment(
    @GetPayload() payload: JwtPayload,
    @Body() commentCreateRequestDto: CommentCreateRequestDto,
    @Param('postId', new ParseIntPipe()) postId: number,
  ) {
    commentCreateRequestDto.UserId = payload.sub;
    commentCreateRequestDto.PostId = postId;

    return await this.commentsService.createComment(commentCreateRequestDto);
  }

  @ApiOperation({ summary: '댓글 수정 API' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Put(':commentId')
  async updateComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @GetPayload() payload: JwtPayload,
    @Body() commentUpdateRequestDto: CommentUpdateRequestDto,
  ) {
    commentUpdateRequestDto.UserId = payload.sub;
    commentUpdateRequestDto.id = commentId;

    return await this.commentsService.updateComment(commentUpdateRequestDto);
  }

  @ApiOperation({ summary: '댓글 삭제 API' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @GetPayload() payload: JwtPayload,
  ) {
    const commentDeleteRequestDto = new CommentDeleteRequestDto();
    commentDeleteRequestDto.id = commentId;
    commentDeleteRequestDto.UserId = payload.sub;

    return await this.commentsService.deleteComment(commentDeleteRequestDto);
  }
}

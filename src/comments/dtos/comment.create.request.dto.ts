import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentCreateRequestDto {
  @ApiProperty({
    example: '와 너무 귀엽다.',
    description: '댓글 내용',
  })
  @IsNotEmpty()
  public comment: string;

  @ApiProperty({
    example: 1,
    description: '대댓글 타겟',
  })
  public target: number;

  public PostId: number;

  public UserId: number;
}

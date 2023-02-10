import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentUpdateRequestDto {
  @ApiProperty({
    example: '와 너무 귀엽다.',
    description: '댓글 내용',
  })
  @IsNotEmpty()
  public comment: string;

  @ApiProperty({ example: 1, description: '댓글의 고유한 ID' })
  public id: number;

  public UserId: number;
}

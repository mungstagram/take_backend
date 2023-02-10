import { ApiProperty } from '@nestjs/swagger';

export class CommentDeleteRequestDto {
  @ApiProperty({ example: 1, description: '댓글의 고유한 ID' })
  public id: number;

  public UserId: number;
}

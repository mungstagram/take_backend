import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostsCreateRequestsDto {
  @ApiProperty({
    example: '게시글 제목입니다',
    description: '제목',
  })
  @IsString()
  @IsNotEmpty()
  public title: string;

  @ApiProperty({
    example: '게시글 내용입니다',
    description: '내용',
  })
  @IsString()
  @IsNotEmpty()
  public content: string;

  @ApiProperty({
    example: 'image or video',
    description: '카테고리',
  })
  @IsNotEmpty()
  public category: string;
}

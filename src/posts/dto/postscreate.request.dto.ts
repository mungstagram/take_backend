import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostsCreateRequestsDto {
  @ApiProperty({
    example: '게시글 내용입니다',
    description: '내용',
  })
  @IsString()
  @IsNotEmpty()
  public content: string;

  // @ApiProperty({
  //   example: '게시글 이미지입니다',
  //   description: '이미지',
  // })
  // @IsNotEmpty()
  // public content_url: string;

  @ApiProperty({
    example: '#댕댕이#간식',
    description: '해시태그',
  })
  @IsNotEmpty()
  public hashTags: string;

  public UserId: number;
}

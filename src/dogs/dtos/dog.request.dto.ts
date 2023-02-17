import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DogRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: '고유 ID' })
  public id: number;

  @ApiProperty({ example: 1, description: '유저의 ID' })
  public UserId: number;

  @ApiProperty({ example: '해피', description: '강아지 이름' })
  public name: string;

  @ApiProperty({ example: '스피츠', description: '견종' })
  public species: string;

  @ApiProperty({ example: '9.8', description: '몸무게' })
  public weight: number;

  @ApiProperty({ example: '2013-02-08', description: '강아지 생년월일' })
  public birthday: Date;

  @ApiProperty({ example: '2013-06-08', description: '강아지 데리고 온 날' })
  public bringDate: Date;

  @ApiProperty({ example: true, description: 'true 남 false 여' })
  public gender: boolean;

  @ApiProperty({ example: '', description: '강아지 이미지 URL' })
  public dog_image: string;

  @ApiProperty({ example: '우리 강아지는 멋져', description: '강아지 소개' })
  public introduce: string;
}

export class DogCreateRequestDto extends OmitType(DogRequestDto, [
  'id',
] as const) {}

export class DogUpdateReqeustDto extends DogCreateRequestDto {}

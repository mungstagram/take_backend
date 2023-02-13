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

  @ApiProperty({ example: '2013-02-08', description: '강아지 생년월일' })
  public birthday: Date;

  @ApiProperty({ example: true, description: 'true 남 false 여' })
  public gender: boolean;

  @ApiProperty({ example: '', description: '프로필 이미지 URL' })
  public photos: string;
}

export class DogCreateRequestDto extends OmitType(DogRequestDto, [
  'id',
] as const) {}

export class DogUpdateReqeustDto extends DogCreateRequestDto {}

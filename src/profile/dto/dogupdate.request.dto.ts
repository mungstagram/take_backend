import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DogUpdateRequestsDto {
  @ApiProperty({
    example: '망고',
    description: '강아지 이름',
  })
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    example: '사람도 무는 강아지',
    description: '강아지 소개',
  })
  @IsString()
  public introduce: string;

  @ApiProperty({
    example: '스피츠',
    description: '견종',
  })
  @IsString()
  public species: string;

  @ApiProperty({
    example: '9',
    description: '강아지 몸무게',
  })
  @Type(() => Number)
  @IsNumber()
  public weight: number;

  @ApiProperty({
    example: '2022-01-18',
    description: '강아지 태어난 날',
  })
  @Type(() => Date)
  @IsDate()
  public birthday: Date;

  @ApiProperty({
    example: '2022-09-18',
    description: '강아지 데리고 온 날',
  })
  @Type(() => Date)
  @IsDate()
  public bringDate: Date;

  @ApiProperty({
    example: 'true',
    description: '대표 강아지 여부',
  })
  @Type(() => Boolean)
  @IsBoolean()
  public representative: boolean;
}

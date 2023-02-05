import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SingupRequestDto {
  @ApiProperty({
    example: 'test@test.com',
    description: '이메일',
  })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    example: 'test',
    description: '비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  public password: string;

  @ApiProperty({
    example: 'f1rstweb',
    description: '닉네임',
  })
  public nickname: string;

  @ApiProperty({ example: '신중완', description: '이름' })
  public name: string;

  @ApiProperty({ example: 'kakao', description: '로그인 종류' })
  public provider: string;
}

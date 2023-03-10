import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupReqeustDto {
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

  public name: string;

  public provider: string;
}

export class UserDataRequestsDto extends SignupReqeustDto {}

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

  @ApiProperty({ example: '신중완', description: '이름' })
  public name: string;

  @ApiProperty({ example: 'kakao', description: '로그인 종류' })
  public provider: string;

  @ApiProperty({
    example:
      'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F24283C3858F778CA2E&imgrefurl=https%3A%2F%2Fblankspace-dev.tistory.com%2F200&tbnid=3bPYTaav1zN1YM&vet=12ahUKEwjT4s-Ojob9AhVqmVYBHQW7BMcQMygAegUIARC5AQ..i&docid=dV6WfPf3OJctQM&w=800&h=500&q=%EC%9D%B4%EB%AF%B8%EC%A7%80&ved=2ahUKEwjT4s-Ojob9AhVqmVYBHQW7BMcQMygAegUIARC5AQ',
    description: '프로필 이미지',
  })
  public profile_image: string;
}

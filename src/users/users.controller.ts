import { SingupRequestDto } from './dtos/signup.request.dto';
import { UsersService } from './users.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '회원가입 API' })
  @ApiConflictResponse({
    description: '닉네임 , 이메일 등이 이미 사용중인 경우.',
  })
  @HttpCode(201)
  @Post('signup')
  async signup(@Body() data: SingupRequestDto) {
    return await this.usersService.signup(data);
  }
}
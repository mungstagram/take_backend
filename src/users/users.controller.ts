import { UserCheckRequestDto } from './dtos/user.reqeust.dto';
import { SignupReqeustDto } from './dtos/signup.request.dto';
import { UsersService } from './users.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '회원가입 API' })
  @ApiConflictResponse({
    description: '닉네임 , 이메일 등이 이미 사용중인 경우.',
  })
  @ApiCreatedResponse({
    description: '회원가입에 성공한 경우',
  })
  @HttpCode(201)
  @Post('signup')
  async signup(@Body() data: SignupReqeustDto) {
    return await this.usersService.signup(data);
  }

  @ApiOperation({ summary: '닉네임, 이메일 유효성, 중복 검사 API' })
  @HttpCode(200)
  @Post('signup/check')
  async check(@Body() userCheckRequestDto: UserCheckRequestDto) {
    return await this.usersService.check(userCheckRequestDto);
  }
}

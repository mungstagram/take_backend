import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from './../auth/jwt/jwt.guard';
import { UserCheckRequestDto } from './dtos/user.reqeust.dto';
import { SignupReqeustDto } from './dtos/signup.request.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
    data.provider = data.provider ? data.provider : 'local';
    return await this.usersService.signup(data);
  }

  @ApiOperation({ summary: '닉네임, 이메일 유효성, 중복 검사 API' })
  @HttpCode(200)
  @Post('signup/check')
  async check(@Body() userCheckRequestDto: UserCheckRequestDto) {
    return await this.usersService.check(userCheckRequestDto);
  }

  @ApiOperation({ summary: 'user detail 유저 정보' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get(':nickname')
  async loadUserData(
    @Param('nickname') nickname: string,
    @GetPayload() payload: JwtPayload,
  ) {
    const userId = payload.sub;
    return await this.usersService.loadUserData(nickname, userId);
  }
}

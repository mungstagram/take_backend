import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from './../auth/jwt/jwt.guard';
import {
  SignupReqeustDto,
  UserDataRequestsDto,
} from './dtos/signup.request.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
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
    return await this.usersService.signup(data);
  }

  @ApiOperation({ summary: '회원정보 조회 API' })
  @ApiCreatedResponse({
    description: '회원정보 조회에 성공한 경우',
  })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get()
  async getUserData(@GetPayload() payload: JwtPayload) {
    return await this.usersService.getUserData(payload);
  }

  @ApiOperation({ summary: '회원정보 수정 API' })
  @ApiCreatedResponse({
    description: '회원정보 수정에 성공한 경우',
  })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Put()
  async updateUserData(
    @Body() data: UserDataRequestsDto,
    @GetPayload() payload: JwtPayload,
  ) {
    return await this.usersService.updateUserData(payload, data);
  }
}

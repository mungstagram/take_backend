import { AuthService } from './auth.service';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.request.dto';
import { Response } from 'express';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Local Login API' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 에러' })
  @ApiUnauthorizedResponse({ description: '로그인 실패시' })
  @ApiOkResponse({ description: '로그인 성공시' })
  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto, @Res() res: Response) {
    const { accessToken, nickname } = await this.authService.login(
      loginRequestDto,
    );
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ nickname });
  }
}

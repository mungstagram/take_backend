import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { join } from 'path';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Get,
  Redirect,
  Query,
  Param,
  Header,
} from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.request.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

interface PostData {
  data: string;
}

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

  @ApiOperation({
    summary: 'RefreshToken을 이용하여 AccessToken을 재발급 하는 API',
  })
  @ApiBearerAuth('Authorization')
  @ApiUnauthorizedResponse({ description: '토큰 인증 에러' })
  @Post('refresh')
  async accessTokenGenerateByRefreshToken(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const accessToken =
      await this.authService.accessTokenGenerateByRefreshToken(
        req.headers['authorization'],
      );
    console.log(accessToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(201).send('Created');
  }

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth(@Req() req) {}

  // @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req) {
  //   return this.authService.googleLogin(req.user);
  // }

  // @Get('kakao')
  // @UseGuards(AuthGuard('kakao'))
  // async kakaologin(@Req() req) {}

  // @Get('kakao/redirect')
  // @UseGuards(AuthGuard('kakao'))
  // kakaologinCallback(@Req() req) {
  //   return this.authService.kakaoLogin(req.user);
  // }

  // @Post('kakao')
  // async kakaoLogin(@Body() token: string) {
  //   return await this.authService.kakaoLogin(token);
  // }
}

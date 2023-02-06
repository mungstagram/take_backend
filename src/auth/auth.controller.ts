import { AuthService } from './auth.service';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.request.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto, @Res() res: Response) {
    const { accessToken, nickname } = await this.authService.login(
      loginRequestDto,
    );
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ nickname });
  }
}

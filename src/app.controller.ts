import { JwtPayload } from './auth/jwt/jwt.payload.dto';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GetPayload } from './common/dacorators/get.payload.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}

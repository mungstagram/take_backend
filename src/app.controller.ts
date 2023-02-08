import { JwtPayload } from './auth/jwt/jwt.payload.dto';
import { JwtAuthGard } from './auth/jwt/jwt.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { GetPayload } from './common/dacorators/get.payload.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGard)
  @Get()
  getHello(@GetPayload() payload: JwtPayload) {
    return payload;
  }
}

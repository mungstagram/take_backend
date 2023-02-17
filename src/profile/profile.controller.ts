import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { GetPayload } from './../common/dacorators/get.payload.decorator';
import { JwtAuthGuard } from './../auth/jwt/jwt.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { Controller, UseGuards, Get, HttpCode, Param } from '@nestjs/common';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  //홈화면 유저프로필
  @ApiOperation({ summary: '홈화면 유저 프로필 조회 api' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(200)
  async getHomeUserProfile(@GetPayload() payload: JwtPayload) {
    const userId = payload.sub;
    return await this.profileService.getHomeUserProfile(userId);
  }

  //유저 프로필 조회
  @ApiOperation({ summary: '유저 프로필 조회 api' })
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get(':nickname')
  @HttpCode(200)
  async getUserProfile(@Param('nickname') nickname: string) {
    return await this.profileService.getUserProfile(nickname);
  }
}

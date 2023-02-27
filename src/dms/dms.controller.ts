import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DmsService } from './dms.service';
import { PopupChatRoomDto } from './dto/popup.chatroom.dto';
import { GetPayload } from 'src/common/dacorators/get.payload.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Post()
  async popupChatRoom(
    @Body() popupChatRoomDto: PopupChatRoomDto,
    @GetPayload() payload: JwtPayload,
  ) {
    popupChatRoomDto.senderId = payload.sub;
    return await this.dmsService.popupChatRoom(popupChatRoomDto);
  }

  @Get('list')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  async findAll(@GetPayload() payload: JwtPayload) {
    const userId = payload.sub;
    return await this.dmsService.getChatRoomList(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Get(':chatRoomId')
  async joinChatRoom(@Param('chatRoomId') chatRoomId: string) {
    return await this.dmsService.joinChatRoom(chatRoomId);
  }
}

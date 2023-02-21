import { JwtPayload } from './../auth/jwt/jwt.payload.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DmsService } from './dms.service';
import { PopupChatRoomDto } from './dto/popup.chatroom.dto';
import { UpdateDmDto } from './dto/update-dm.dto';
import { GetPayload } from 'src/common/dacorators/get.payload.decorator';

@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async popupChatRoom(
    @Body() popupChatRoomDto: PopupChatRoomDto,
    @GetPayload() payload: JwtPayload,
  ) {
    popupChatRoomDto.senderId = payload.sub;
    return await this.dmsService.popupChatRoom(popupChatRoomDto);
  }

  @Get()
  findAll() {
    return this.dmsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatRoomId')
  async joinChatRoom(@Param('chatRoomId') chatRoomId: string) {
    return await this.dmsService.joinChatRoom(chatRoomId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDmDto: UpdateDmDto) {
    return this.dmsService.update(+id, updateDmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dmsService.remove(+id);
  }
}

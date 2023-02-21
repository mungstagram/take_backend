import { PartialType } from '@nestjs/swagger';
import { PopupChatRoomDto } from './popup.chatroom.dto';

export class UpdateDmDto extends PartialType(PopupChatRoomDto) {}

import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PopupChatRoomDto {
  @ApiProperty({ description: 'DM 받을 상대의 UserId' })
  @IsNotEmpty()
  public receiverId: number;

  public senderId: number;
}

import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  collection: 'chatRooms',
  timestamps: true,
};

@Schema(options)
export class ChatRooms extends Document {
  @Prop({ required: true })
  users: number[];
}

export const ChatRoomsSchema = SchemaFactory.createForClass(ChatRooms);

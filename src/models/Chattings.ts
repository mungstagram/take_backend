import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  collection: 'chattings',
  timestamps: true,
};

@Schema(options)
export class Chattings extends Document {
  @Prop({ required: true, type: String })
  message: string;

  @Prop({ type: String })
  contentUrl: string;

  @Prop({ required: true, type: Number })
  SenderId: number;

  @Prop({ required: true, type: Number })
  ReceiverId: number;

  @Prop({ required: true, type: String })
  RoomId: string;
}

export const ChattingsSchema = SchemaFactory.createForClass(Chattings);

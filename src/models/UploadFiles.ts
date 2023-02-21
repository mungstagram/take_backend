import { Prop, Schema, SchemaFactory, SchemaOptions } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const options: SchemaOptions = {
  collection: 'uploadFiles',
  timestamps: true,
};

@Schema(options)
export class UploadFiles extends Document {
  @Prop({ required: true, type: String })
  contentUrl: string;

  @Prop({ required: true, type: String })
  hash: string;
}

export const UploadFilesSchema = SchemaFactory.createForClass(UploadFiles);

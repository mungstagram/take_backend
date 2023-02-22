import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadFiles } from '../models/UploadFiles';

export class FileUrlService {
  constructor(
    @InjectModel(UploadFiles.name)
    private readonly uploadFileModel: Model<UploadFiles>,
  ) {}

  async getUrl(id: string[]) {
    const url = await Promise.all(
      id.map(async (v) => {
        return (await this.uploadFileModel.findById(v)).contentUrl;
      }),
    );
    return url;
  }
}

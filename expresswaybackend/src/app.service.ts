import { Injectable, UploadedFile } from '@nestjs/common';

@Injectable()
export class AppService {
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Upload thành công',
      filename: file.filename,
      path: `/images/${file.filename}`,
    };
  }
}

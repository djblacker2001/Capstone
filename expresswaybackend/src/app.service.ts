import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Upload thành công',
      filename: file.filename,
      path: `/images/${file.filename}`,
    };
  }

  async deleteImage(filename: string) {
    const filePath = join(__dirname, '..', 'uploads', 'images', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File ảnh không tồn tại trên hệ thống hoặc đã bị xóa trước đó!');
    }

    try {
      fs.unlinkSync(filePath);
      return {
        success: true,
        message: `Xóa file ${filename} thành công!`,
      };
    } catch (error: any) {
      throw new Error(`Có lỗi xảy ra khi xóa file: ${error.message}`);
    }
  }
}

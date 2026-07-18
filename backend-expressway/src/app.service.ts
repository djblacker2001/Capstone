import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async getAllUploadedFiles(): Promise<string[]> {
    const dirPath = join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(dirPath);
    return files;
  }

  async getFile(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'uploads', 'images', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        this.i18n.t('upload.NOT_FOUND', { lang: this.lang })
      );
    }
    return filePath;
  }

  async deleteImage(filename: string) {
    const filePath = join(process.cwd(), 'uploads', 'images', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        this.i18n.t('upload.NOT_FOUND', { lang: this.lang })
      );
    }

    try {
      fs.unlinkSync(filePath);
      return {
        success: true,
        message: this.i18n.t('upload.DELETE_SUCCESS', { 
          lang: this.lang, 
          args: { filename } 
        }),
      };
    } catch (error: any) {
      throw new Error(
        this.i18n.t('upload.DELETE_ERROR', { lang: this.lang, args: { error: error.message } })
      );
    }
  }
}
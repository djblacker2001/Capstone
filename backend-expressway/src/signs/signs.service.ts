import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Sign } from './signs.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SignsService {
  constructor(
    @InjectRepository(Sign)
    private readonly signRepository: Repository<Sign>,
    private readonly i18n: I18nService,
  ) { }

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findAll(): Promise<Sign[]> {
    return await this.signRepository.find({
      relations: ['signType'],
    });
  }

  async findOne(id: number): Promise<Sign> {
    const sign = await this.signRepository.findOne({
      where: { SignId: id },
      relations: ['signType'],
    });
    if (!sign) {
      throw new NotFoundException(
        this.i18n.t('sign.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    return sign;
  }

  async findBySignType(signTypeId?: number): Promise<Sign[]> {
    return await this.signRepository.find({
      where: { signType: { SignTypeId: signTypeId } },
      relations: ['signType'],
    });
  }

  async searchByDescription(keyword: string) {
    const signs = await this.signRepository.find({
      where: {
        Description: Like(`%${keyword}%`),
      },
      relations: ['signType'],
    });

    if (signs.length === 0) {
      throw new NotFoundException(
        this.i18n.t('sign.SEARCH_EMPTY', { lang: this.lang, args: { keyword } })
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('sign.SEARCH_SUCCESS', { lang: this.lang, args: { count: signs.length } }),
      data: signs,
    };
  }

  async create(data: Partial<Sign>): Promise<Sign> {
    const newSign = this.signRepository.create(data);
    const savedSign = await this.signRepository.save(newSign);
    return this.findOne(savedSign.SignId);
  }

  private cleanPayload<T extends Record<string, any>>(data: T): Partial<T> {
    const cleaned: Record<string, any> = {};

    Object.keys(data).forEach((key) => {
      if (key === 'SignId' || key === 'id') {
        return;
      }

      const value = data[key];
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    return cleaned as Partial<T>;
  }

  async update(id: number, data: Partial<Sign>): Promise<Sign> {
    await this.findOne(id);
    const updatePayload = this.cleanPayload(data);
    if (Object.keys(updatePayload).length > 0) {
      await this.signRepository.update(id, updatePayload);
    }

    return this.findOne(id);
  }

  async updateImage(id: number, data: Partial<Sign>, newImagePath?: string): Promise<Sign> {
    const existingSign = await this.findOne(id);
    const updatePayload: Partial<Sign> = this.cleanPayload(data);
    
    if (newImagePath) {
      updatePayload.Image = newImagePath;
      if (existingSign.Image) {
        const oldFileAbsolutePath = path.resolve(process.cwd(), existingSign.Image);

        try {
          if (fs.existsSync(oldFileAbsolutePath)) {
            fs.unlinkSync(oldFileAbsolutePath);
            console.log(`[Multer-Cleanup] Đã xóa thành công file ảnh cũ: ${oldFileAbsolutePath}`);
          }
        } catch (fileErr) {
          console.error(`[Multer-Cleanup Error] Không thể xóa file cũ:`, fileErr);
        }
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await this.signRepository.update({ SignId: id }, updatePayload);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<any> {
    const existingSign = await this.findOne(id);
    if (existingSign.Image) {
      const fileAbsolutePath = path.resolve(process.cwd(), existingSign.Image);
      try {
        if (fs.existsSync(fileAbsolutePath)) {
          fs.unlinkSync(fileAbsolutePath);
        }
      } catch (err) {
        console.error(`[Delete Error] Không thể xóa ảnh biển báo:`, err);
      }
    }

    await this.signRepository.delete(id);

    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('sign.DELETE_SUCCESS', { lang: this.lang, args: { id } }),
    };
  }
}
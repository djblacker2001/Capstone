import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Sign } from './signs.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SignsService {
  constructor(
    @InjectRepository(Sign)
    private readonly signRepository: Repository<Sign>,
    private readonly i18n: I18nService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findAll(): Promise<Sign[]> {
    return await this.signRepository.find();
  }

  async findOne(id: number): Promise<Sign> {
    const sign = await this.signRepository.findOne({ where: { SignId: id } });
    if (!sign) {
      throw new NotFoundException(
        this.i18n.t('sign.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    return sign;
  }

  async searchByDescription(keyword: string) {
    const signs = await this.signRepository.find({
      where: {
        Description: Like(`%${keyword}%`),
      },
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
    return await this.signRepository.save(newSign);
  }

  async update(id: number, data: Partial<Sign>): Promise<Sign> {
    await this.findOne(id);
    await this.signRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<any> {
    await this.findOne(id);
    await this.signRepository.delete(id);
    
    return {
      success: true,
      statusCode: 200,
      message: this.i18n.t('sign.DELETE_SUCCESS', { lang: this.lang, args: { id } }),
    };
  }
}
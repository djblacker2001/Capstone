import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './provinces.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    private readonly i18n: I18nService,
  ) { }

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findAll() {
    return this.provinceRepository.find();
  }

  async findOneProvince(id: number) {
    const province = await this.provinceRepository.findOneBy({ ProvinceId: id });
    if (!province) {
      throw new NotFoundException(
        this.i18n.t('province.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    return province;
  }

  async create(data: Partial<Province>): Promise<Province> {
    const newProvince = this.provinceRepository.create(data);
    return await this.provinceRepository.save(newProvince);
  }

  async update(id: number, data: Partial<Province>): Promise<Province> {
    await this.provinceRepository.update(id, data);
    return this.findOneProvince(id);
  }

  async remove(id: number): Promise<any> {
    await this.provinceRepository.delete(id);
  }
}
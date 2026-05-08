import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './provinces.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) {}

  findAll() {
    return this.provinceRepository.find();
  }

  findOne(id: number) {
    return this.provinceRepository.findOneBy({ ProvinceId: id });
  }

  create(data: Partial<Province>) {
    const province = this.provinceRepository.create(data);
    return this.provinceRepository.save(province);
  }

  async remove(id: number) {
    await this.provinceRepository.delete(id);
    return { message: `Đã xóa tỉnh có ID ${id}` };
  }
}

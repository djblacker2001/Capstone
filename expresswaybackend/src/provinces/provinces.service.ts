import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './provinces.entity';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
  ) { }

  findAll() {
    return this.provinceRepository.find();
  }

  findOne(id: number) {
    return this.provinceRepository.findOneBy({ ProvinceId: id });
  }

  async create(data: Partial<Province>): Promise<Province> {
    const newProvince = this.provinceRepository.create(data);
    return await this.provinceRepository.save(newProvince);
  }

  async update(id: number, data: Partial<Province>): Promise<Province> {
    await this.provinceRepository.update(id, data);
    const updatedProvince = await this.findOne(id);
    if (!updatedProvince) {
      throw new NotFoundException(`Không tìm thấy tỉnh thành với ID: ${id}`);
    }
    return updatedProvince;
  }

  async remove(id: number) {
    await this.provinceRepository.delete(id);
    return { message: `Đã xóa tỉnh có ID ${id}` };
  }
}

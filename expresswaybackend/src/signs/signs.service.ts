import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sign } from './signs.entity';

@Injectable()
export class SignsService {
  constructor(
    @InjectRepository(Sign)
    private readonly signRepository: Repository<Sign>,
  ) {}

  // Lấy tất cả biển báo
  async findAll(): Promise<Sign[]> {
    return await this.signRepository.find();
  }

  // Tìm một biển báo theo ID
  async findOne(id: number): Promise<Sign> {
    const sign = await this.signRepository.findOne({ where: { SignId: id } });
    if (!sign) {
      throw new NotFoundException(`Không tìm thấy biển báo có ID là ${id}`);
    }
    return sign;
  }

  // Tạo mới biển báo (Lưu tên, link ảnh và mô tả)
  async create(data: Partial<Sign>): Promise<Sign> {
    const newSign = this.signRepository.create(data);
    return await this.signRepository.save(newSign);
  }

  // Cập nhật thông tin biển báo
  async update(id: number, data: Partial<Sign>): Promise<Sign> {
    await this.findOne(id); // Kiểm tra tồn tại trước khi update
    await this.signRepository.update(id, data);
    return this.findOne(id);
  }

  // Xóa biển báo
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.signRepository.delete(id);
  }
}
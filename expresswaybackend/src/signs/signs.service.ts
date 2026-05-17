import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Sign } from './signs.entity';

@Injectable()
export class SignsService {
  constructor(
    @InjectRepository(Sign)
    private readonly signRepository: Repository<Sign>,
  ) {}

  async findAll(): Promise<Sign[]> {
    return await this.signRepository.find();
  }

  async findOne(id: number): Promise<Sign> {
    const sign = await this.signRepository.findOne({ where: { SignId: id } });
    if (!sign) {
      throw new NotFoundException(`Không tìm thấy biển báo có ID là ${id}`);
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
      throw new NotFoundException(`Không tìm thấy biển báo nào có mô tả khớp với từ khóa: "${keyword}"`);
    }

    return {
      success: true,
      statusCode: 200,
      message: `Tìm thấy ${signs.length} biển báo phù hợp với mô tả!`,
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

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.signRepository.delete(id);
  }
}
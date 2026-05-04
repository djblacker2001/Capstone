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
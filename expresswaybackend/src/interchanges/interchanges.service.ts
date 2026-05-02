import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interchange } from './interchanges.entity';

@Injectable()
export class InterchangesService {
  constructor(
    @InjectRepository(Interchange)
    private readonly interchangeRepository: Repository<Interchange>,
  ) {}

  // Lấy tất cả nút giao kèm thông tin đoạn đường tương ứng
  async findAll(): Promise<Interchange[]> {
    return await this.interchangeRepository.find({ relations: ['section'] });
  }

  // Lấy danh sách các nút giao thuộc về một đoạn đường cụ thể
  async findBySection(sectionId: number): Promise<Interchange[]> {
    return await this.interchangeRepository.find({
      where: { SectionId: sectionId }
    });
  }

  // TẠO MỚI: Cho phép tạo nhiều nút giao cho cùng một SectionId
  async create(data: Partial<Interchange>): Promise<Interchange> {
    const newInterchange = this.interchangeRepository.create(data);
    return await this.interchangeRepository.save(newInterchange);
  }

  // CẬP NHẬT & XÓA (Giữ nguyên logic cơ bản)
  async update(id: number, data: Partial<Interchange>): Promise<Interchange> {
    await this.interchangeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.interchangeRepository.delete(id);
  }

  async findOne(id: number): Promise<Interchange> {
    const interchange = await this.interchangeRepository.findOne({ where: { InterchangeId: id } });
    if (!interchange) throw new NotFoundException(`Không tìm thấy nút giao ID ${id}`);
    return interchange;
  }
}
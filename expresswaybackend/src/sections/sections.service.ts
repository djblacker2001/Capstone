import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './sections.entity';

@Injectable()
export class SectionsService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) { }

    // Lấy danh sách đoạn đường kèm thông tin tuyến cao tốc cha
    async findAll(): Promise<Section[]> {
        return await this.sectionRepository.find({
            relations: ['expressway'],
        });
    }

    // Lấy chi tiết một đoạn đường và các hạ tầng đi kèm (Cầu, Hầm, Nút giao)
    async findOne(id: number): Promise<Section> {
        const section = await this.sectionRepository.findOne({
            where: { SectionId: id },
            relations: ['expressway', 'bridges', 'tunnels', 'interchanges'],
        });

        if (!section) {
            throw new NotFoundException(`Không tìm thấy đoạn đường với ID ${id}`);
        }
        return section;
    }

    // Tạo mới một đoạn đường
    async create(data: Partial<Section>): Promise<Section> {
        const newSection = this.sectionRepository.create(data);
        return await this.sectionRepository.save(newSection);
    }
}
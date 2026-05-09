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

    async findAll(): Promise<Section[]> {
        return await this.sectionRepository.find({
            relations: ['expressway'],
        });
    }

    async findOne(id: number): Promise<Section> {
        const section = await this.sectionRepository.findOne({
            where: { SectionId: id },
            relations: ['expressway'],
        });

        if (!section) {
            throw new NotFoundException(`Không tìm thấy đoạn đường với ID ${id}`);
        }
        return section;
    }

    async create(data: Partial<Section>): Promise<Section> {
        const newSection = this.sectionRepository.create(data);
        return await this.sectionRepository.save(newSection);
    }

    async update(id: number, data: Partial<Section>): Promise<Section> {
        await this.sectionRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.sectionRepository.delete(id);
    }
}
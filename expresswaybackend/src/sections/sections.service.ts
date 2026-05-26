import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, LessThanOrEqual, Repository, Like } from 'typeorm';
import { Section } from './sections.entity';

@Injectable()
export class SectionsService {
    constructor(
        @InjectRepository(Section) private readonly sectionRepository: Repository<Section>,

    ) { }

    async findAll() {
        return this.sectionRepository.find({});
    }

    async findAllSection(name?: string, status?: string, provinceName?: string) {
        const whereCondition: any = {};
        if (name) {
            const sections = await this.sectionRepository.find({
                where: {
                    NameSection: Like(`%${name}%`),
                },
            });

            return {
                success: true,
                statusCode: 200,
                message: `Tìm thấy các đoạn đường có tên chứa từ khóa: "${name}"`,
                data: sections,
            };
        }

        if (status) {
            whereCondition.Status = status;
        }

        if (provinceName) {
            whereCondition.ProvinceName = provinceName;
        }

        const sections = await this.sectionRepository.find({
            where: whereCondition,
            relations: ['bridge', 'interchange', 'tunnel', 'province', 'restStop']
        });

        let dynamicMessage = 'Lấy toàn bộ danh sách đoạn đường thành công!';
        if (name && status) {
            dynamicMessage = `Tìm thấy các đoạn đường có tên chứa "${name}" và trạng thái là "${status}"`;
        } else if (name) {
            dynamicMessage = `Tìm thấy các đoạn đường có tên chứa từ khóa: "${name}"`;
        } else if (status) {
            dynamicMessage = `Tìm thấy các đoạn đường có trạng thái là: "${status}"`;
        }

        return {
            success: true,
            statusCode: 200,
            message: dynamicMessage,
            data: sections,
        };
    }



    async findOne(id: number): Promise<Section> {
        const section = await this.sectionRepository.findOne({
            where: { SectionId: id },
            relations: ['bridge', 'interchange', 'tunnel', 'restStop', 'province'],
        });

        if (!section) {
            throw new NotFoundException(`Không tìm thấy đoạn đường với ID ${id}`);
        }
        return section;
    }

    async findSectionByKm(km: number) {
        const section = await this.sectionRepository.findOne({
            where: [
                {
                    StartKm: LessThanOrEqual(km),
                    EndKm: MoreThanOrEqual(km),
                }
            ],
            relations: ['expressway'],
        });

        if (!section) {
            return {
                success: false,
                statusCode: 404,
                message: `Không tìm thấy tuyến đường nào bao phủ vị trí Km ${km}`,
                data: null
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: 'Tìm thấy thông tin đoạn tuyến thành công!',
            data: section
        };
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

    async getSectionStatistics() {
        return await this.sectionRepository
            .createQueryBuilder('section')
            .leftJoin('section.expressway', 'expressway')
            .leftJoin('section.bridge', 'bridge')
            .leftJoin('section.tunnel', 'tunnel')
            .leftJoin('section.interchange', 'interchange')
            .leftJoin('section.province', 'province')
            .select([
                'section.SectionId AS id',
                'section.NameSection AS sectionName',
                'expressway.NameExpressway AS expresswayName',
            ])

            .addSelect('COUNT(DISTINCT bridge.BridgeId)', 'bridgeCount')
            .addSelect('COUNT(DISTINCT tunnel.TunnelId)', 'tunnelCount')
            .addSelect('COUNT(DISTINCT interchange.InterchangeId)', 'interchangeCount')
            .addSelect('COUNT(DISTINCT province.ProvinceId)', 'provinceCount')
            .groupBy('section.SectionId')
            .addGroupBy('section.NameSection')
            .addGroupBy('expressway.NameExpressway')
            .getRawMany();
    }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expressway } from '../expressways/expressways.entity';
import { Section } from '../sections/sections.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Expressway)
        private expresswayRepo: Repository<Expressway>,
        @InjectRepository(Section)
        private sectionRepo: Repository<Section>,
    ) { }

    async getDashboardStats() {
        // Tổng số tuyến cao tốc
        const totalExpressways = await this.expresswayRepo.count();

        // Tổng chiều dài
        const sumResult = await this.expresswayRepo
            .createQueryBuilder('e')
            .select('SUM(e.TotalLength)', 'total')
            .getRawOne();
        const totalLength = parseFloat(sumResult.total) || 0;

        // Số đoạn đã hoàn thành
        const completedSections = await this.sectionRepo.count({
            where: { Status: 'Hoàn thành' },
        });

        // Số đoạn đang thi công
        const underConstruction = await this.sectionRepo.count({
            where: { Status: 'Đang thi công' },
        });

        // Số đoạn đang thi công mở rộng
        const extendConstruction = await this.sectionRepo.count({
            where: { Status: 'Đang thi công mở rộng' },
        });

        // Thống kê số lượng tuyến theo trạng thái
        const statusStats = await this.sectionRepo
            .createQueryBuilder('s')
            .select('s.Status', 'status')
            .addSelect('COUNT(s.SectionId)', 'count')
            .groupBy('s.Status')
            .getRawMany();

        return {
            summary: {
                totalExpressways,
                totalLength,
                completedSections,
                underConstruction,
                extendConstruction,
            },
            statusStats,
        };
    }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, LessThanOrEqual, Repository, Like } from 'typeorm';
import { Section } from './sections.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SectionsService {
    constructor(
        @InjectRepository(Section) private readonly sectionRepository: Repository<Section>,
        private readonly i18n: I18nService,
    ) { }

    private get lang(): string {
        return I18nContext.current()?.lang || 'en';
    }

    async findAll() {
        return this.sectionRepository.find({
            relations: ["province", "bridge", "restStop", "tunnel", "interchange"]
        });
    }

    async findAllSection(name?: string, status?: string, provinceName?: string) {
        const query = this.sectionRepository.createQueryBuilder('section')
            .leftJoinAndSelect('section.bridge', 'bridge')
            .leftJoinAndSelect('section.interchange', 'interchange')
            .leftJoinAndSelect('section.tunnel', 'tunnel')
            .leftJoinAndSelect('section.province', 'province')
            .leftJoinAndSelect('section.restStop', 'restStop');

        if (name) {
            query.andWhere('section.NameSection LIKE :name', { name: `%${name}%` });
        }

        if (status) {
            query.andWhere('section.Status = :status', { status });
        }

        if (provinceName) {
            query.andWhere('province.ProvinceName LIKE :provinceName', { provinceName: `%${provinceName}%` });
        }

        query.orderBy('section.SectionId', 'ASC');
        const sections = await query.getMany();
        let dynamicMessage = this.i18n.t('section.FETCH_ALL_SUCCESS', { lang: this.lang });

        if (name && status) {
            dynamicMessage = this.i18n.t('section.SEARCH_BOTH', { lang: this.lang, args: { name, status } });
        } else if (name) {
            dynamicMessage = this.i18n.t('section.SEARCH_NAME', { lang: this.lang, args: { name } });
        } else if (status) {
            dynamicMessage = this.i18n.t('section.SEARCH_STATUS', { lang: this.lang, args: { status } });
        } else if (provinceName) {
            dynamicMessage = `Search by province successfully: ${provinceName}`;
        }

        return {
            success: true,
            statusCode: 200,
            message: dynamicMessage,
            data: sections,
        };
    }

    async findOneSection(id: number): Promise<Section> {
        const section = await this.sectionRepository.findOne({
            where: { SectionId: id },
            relations: ['bridge', 'interchange', 'tunnel', 'restStop', 'province'],
        });

        if (!section) {
            throw new NotFoundException(
                this.i18n.t('section.NOT_FOUND', { lang: this.lang, args: { id } })
            );
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
                message: this.i18n.t('section.KM_NOT_FOUND', { lang: this.lang, args: { km } }),
                data: null
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: this.i18n.t('section.KM_FOUND', { lang: this.lang }),
            data: section
        };
    }

    async create(data: Partial<Section>): Promise<Section> {
        const newSection = this.sectionRepository.create(data);
        return await this.sectionRepository.save(newSection);
    }

    async update(id: number, data: Partial<Section>): Promise<Section> {
        await this.sectionRepository.update(id, data);
        return this.findOneSection(id);
    }

    async remove(id: number): Promise<void> {
        await this.findOneSection(id);
        await this.sectionRepository.delete(id);
    }

    async getSectionStatistics() {
        const rawData = await this.sectionRepository
            .createQueryBuilder('section')
            .leftJoin('section.expressway', 'expressway')
            .leftJoin('section.bridge', 'bridge')
            .leftJoin('section.tunnel', 'tunnel')
            .leftJoin('section.interchange', 'interchange')
            .leftJoin('section.province', 'province')
            .select([
                'section.SectionId AS id',
                'section.NameSection AS sectionName',
                'section.Length AS totalSectionLength',
                'expressway.NameExpressway AS expresswayName',
            ])
            .addSelect('COUNT(DISTINCT bridge.BridgeId)', 'bridgeCount')
            .addSelect('COUNT(DISTINCT tunnel.TunnelId)', 'tunnelCount')
            .addSelect('COUNT(DISTINCT interchange.InterchangeId)', 'interchangeCount')
            .addSelect('COUNT(DISTINCT province.ProvinceId)', 'provinceCount')

            .addSelect("SUM(CASE WHEN interchange.status = 'Complete' THEN 1 ELSE 0 END)", 'interchangeCompleteCount')
            .addSelect("SUM(CASE WHEN interchange.status = 'Under construction' THEN 1 ELSE 0 END)", 'interchangeUnderConstructionCount')
            .addSelect("SUM(CASE WHEN interchange.status = 'Not yet construction' THEN 1 ELSE 0 END)", 'interchangeNotYetConstructionCount')

            .groupBy('section.SectionId')
            .addGroupBy('section.NameSection')
            .addGroupBy('section.Length')
            .addGroupBy('expressway.NameExpressway')
            .orderBy('section.SectionId', 'ASC')
            .getRawMany();

        return rawData.map((item) => ({
            ...item,
            id: parseInt(item.id) || 0,
            totalSectionLength: parseFloat(item.totalSectionLength) || 0,
            bridgeCount: parseInt(item.bridgeCount) || 0,
            tunnelCount: parseInt(item.tunnelCount) || 0,
            interchangeCount: parseInt(item.interchangeCount) || 0,
            provinceCount: parseInt(item.provinceCount) || 0,

            interchangeCompleteCount: parseInt(item.interchangeCompleteCount) || 0,
            interchangeUnderConstructionCount: parseInt(item.interchangeUnderConstructionCount) || 0,
            interchangeNotYetConstructionCount: parseInt(item.interchangeNotYetConstructionCount) || 0,
        }));
    }
}
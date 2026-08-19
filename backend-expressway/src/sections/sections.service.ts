import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, LessThanOrEqual, Repository, Like } from 'typeorm';
import { Section } from './sections.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateSectionDto } from './dto/update-sections.dto';
import { Province } from '../provinces/provinces.entity';

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
            relations: ["province", "bridge", "restStop", "tunnel", "interchange"],
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
            relations: ["province", "bridge", "restStop", "tunnel", "interchange"]
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

    async updateSectionWithFiles(
        id: number,
        data: UpdateSectionDto,
        newImagePath?: string,
        newSpeedSignPath?: string,
        newMapFilePath?: string,
    ): Promise<Section> {
        const existingSection = await this.findOneSection(id);
        if (!existingSection) {
            throw new NotFoundException(`Không tìm thấy phân đoạn với ID: ${id}`);
        }

        const updatePayload: Partial<Section> = {};

        if (data.NameSection !== undefined) updatePayload.NameSection = data.NameSection;
        if (data.Length !== undefined) updatePayload.Length = Number(data.Length);
        if (data.StartLocation !== undefined) updatePayload.StartLocation = data.StartLocation;
        if (data.StartKm !== undefined) updatePayload.StartKm = Number(data.StartKm);
        if (data.EndLocation !== undefined) updatePayload.EndLocation = data.EndLocation;
        if (data.EndKm !== undefined) updatePayload.EndKm = Number(data.EndKm);
        if (data.SpeedLimit !== undefined) updatePayload.SpeedLimit = data.SpeedLimit;
        if (data.TrafficLand !== undefined) updatePayload.TrafficLand = Number(data.TrafficLand);
        if (data.HasEmergencyLand !== undefined) updatePayload.HasEmergencyLand = Boolean(data.HasEmergencyLand);
        if (data.Status !== undefined) updatePayload.Status = data.Status;
        if (newImagePath) {
            updatePayload.Image = newImagePath;
            if (existingSection.Image) {
                this.deleteOldFile(existingSection.Image, 'ảnh phân đoạn');
            }
        }

        if (newSpeedSignPath) {
            updatePayload.SpeedSign = newSpeedSignPath;
            if (existingSection.SpeedSign) {
                this.deleteOldFile(existingSection.SpeedSign, 'ảnh biển báo tốc độ');
            }
        }

        if (newMapFilePath) {
            updatePayload.MapData = newMapFilePath;
            if (existingSection.MapData) {
                this.deleteOldFile(existingSection.MapData, 'file JSON bản đồ');
            }
        }

        const rawProvinceIds = data.provinceIds ?? (data as any).ProvinceIds;

        if (rawProvinceIds !== undefined) {
            let provinceIdsArray: number[] = [];
            if (Array.isArray(rawProvinceIds)) {
                provinceIdsArray = rawProvinceIds.map((pId) => Number(pId));
            } else if (typeof rawProvinceIds === 'string') {
                try {
                    const parsed = JSON.parse(rawProvinceIds);
                    provinceIdsArray = Array.isArray(parsed) ? parsed.map(Number) : [];
                } catch {
                    provinceIdsArray = rawProvinceIds.split(',').map((pId) => Number(pId.trim())).filter((n) => !isNaN(n));
                }
            }

            updatePayload.province = provinceIdsArray.map((pId) => ({ ProvinceId: pId } as Province));
        }

        const sectionToSave = this.sectionRepository.merge(existingSection, updatePayload);
        await this.sectionRepository.save(sectionToSave);

        return this.findOneSection(id);
    }

    private deleteOldFile(relativeFilePath: string, fileLabel: string) {
        try {
            const absolutePath = path.resolve(process.cwd(), relativeFilePath);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        } catch (err) {
            console.error(`[Cleanup Error] Không thể xóa ${fileLabel} cũ:`, err);
        }
    }

    async remove(id: number): Promise<void> {
        await this.findOneSection(id);
        await this.sectionRepository.delete(id);
    }

    async getSectionStatistics() {
        const rawData = await this.sectionRepository
            .createQueryBuilder('section')
            .leftJoin('section.expressway', 'expressway')
            .select([
                'section.SectionId AS id',
                'section.NameSection AS sectionName',
                'section.Length AS totalSectionLength',
                'expressway.NameExpressway AS expresswayName',
            ])

            .addSelect('(SELECT COUNT(1) FROM dbo.Bridge b WHERE b.SectionId = section.SectionId)', 'bridgeCount')
            .addSelect('(SELECT COUNT(1) FROM dbo.Tunnel t WHERE t.SectionId = section.SectionId)', 'tunnelCount')
            .addSelect('(SELECT COUNT(1) FROM dbo.Interchange i WHERE i.SectionId = section.SectionId)', 'interchangeCount')
            .addSelect('(SELECT COUNT(1) FROM dbo.SectionProvince sp WHERE sp.SectionId = section.SectionId)', 'provinceCount')

            .addSelect("(SELECT COUNT(1) FROM dbo.Interchange i WHERE i.SectionId = section.SectionId AND i.Status = 'Complete')", 'interchangeCompleteCount')
            .addSelect("(SELECT COUNT(1) FROM dbo.Interchange i WHERE i.SectionId = section.SectionId AND i.Status = 'Under construction')", 'interchangeUnderConstructionCount')
            .addSelect("(SELECT COUNT(1) FROM dbo.Interchange i WHERE i.SectionId = section.SectionId AND i.Status = 'Not yet construction')", 'interchangeNotYetConstructionCount')

            .addSelect('(SELECT COUNT(1) FROM dbo.RestStop r WHERE r.SectionId = section.SectionId)', 'restStopCount')
            .addSelect("(SELECT COUNT(1) FROM dbo.RestStop r WHERE r.SectionId = section.SectionId AND r.Status = 'Operating')", 'restStopOperatingCount')
            .addSelect("(SELECT COUNT(1) FROM dbo.RestStop r WHERE r.SectionId = section.SectionId AND r.Status = 'Under construction')", 'restStopUnderConstructionCount')
            .addSelect("(SELECT COUNT(1) FROM dbo.RestStop r WHERE r.SectionId = section.SectionId AND r.Status = 'Not yet under construction')", 'restStopNotYetConstructionCount')

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

            restStopCount: parseInt(item.restStopCount) || 0,
            restStopOperatingCount: parseInt(item.restStopOperatingCount) || 0,
            restStopUnderConstructionCount: parseInt(item.restStopUnderConstructionCount) || 0,
            restStopNotYetConstructionCount: parseInt(item.restStopNotYetConstructionCount) || 0,
        }));
    }
}
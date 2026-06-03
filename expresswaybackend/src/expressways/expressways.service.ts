import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway)
    private expresswayRepository: Repository<Expressway>,
    private readonly i18n: I18nService,
  ) { }

  private readonly commonRelations = [
    'section',
    'section.bridge',
    'section.restStop',
    'section.interchange',
    'section.tunnel',
    'section.province'
  ];

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async getGlobalStats() {
    const sectionAndRestStopQuery = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .leftJoin('section.restStop', 'restStop')
      .select([
        'COUNT(DISTINCT expressway.ExpresswayId) AS totalExpressways',
        'COUNT(DISTINCT section.SectionId) AS totalSections',
      ])
      .addSelect('SUM(section.Length)', 'totalSystemLength')
      .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Complete' THEN section.SectionId END)", 'totalCompleted')
      .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Under construction' THEN section.SectionId END)", 'totalUnderConstruction')
      .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Extend under construction' THEN section.SectionId END)", 'totalExtendConstruction')

      .addSelect("COUNT(restStop.RestStopId) AS totalRestStops")
      .addSelect("SUM(CASE WHEN restStop.Status = N'Under construction' THEN 1 ELSE 0 END)", 'restStopUnderConstruction')
      .addSelect("SUM(CASE WHEN restStop.Status = N'Not yet construction' THEN 1 ELSE 0 END)", 'restStopNotYetConstruction')
      .addSelect("SUM(CASE WHEN restStop.Status = N'Operating' THEN 1 ELSE 0 END)", 'restStopOperating')
      .getRawOne();

    const interchangeQuery = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .leftJoin('section.interchange', 'interchange')
      .select([
        "COUNT(DISTINCT CONCAT(interchange.NameInterchange, '_', interchange.Status)) AS totalUniqueInterchanges",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Under construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeUnderConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Not yet construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeNotYetConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Complete' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeComplete"
      ])
      .getRawOne();

    return {
      totalExpressways: parseInt(sectionAndRestStopQuery.totalExpressways) || 0,
      totalSections: parseInt(sectionAndRestStopQuery.totalSections) || 0,
      totalSystemLength: parseFloat(sectionAndRestStopQuery.totalSystemLength) || 0,
      totalCompleted: parseInt(sectionAndRestStopQuery.totalCompleted) || 0,
      totalUnderConstruction: parseInt(sectionAndRestStopQuery.totalUnderConstruction) || 0,
      totalExtendConstruction: parseInt(sectionAndRestStopQuery.totalExtendConstruction) || 0,

      totalRestStops: parseInt(sectionAndRestStopQuery.totalRestStops) || 0,
      restStopUnderConstruction: parseInt(sectionAndRestStopQuery.restStopUnderConstruction) || 0,
      restStopNotYetConstruction: parseInt(sectionAndRestStopQuery.restStopNotYetConstruction) || 0,
      restStopOperating: parseInt(sectionAndRestStopQuery.restStopOperating) || 0,

      totalUniqueInterchanges: parseInt(interchangeQuery.totalUniqueInterchanges) || 0,
      interchangeUnderConstruction: parseInt(interchangeQuery.interchangeUnderConstruction) || 0,
      interchangeNotYetConstruction: parseInt(interchangeQuery.interchangeNotYetConstruction) || 0,
      interchangeComplete: parseInt(interchangeQuery.interchangeComplete) || 0,
    };
  }

  async create(data: any) {
    const nameExpressway = data.NameExpressway || data.nameExpressway;
    if (nameExpressway) {
      const isExist = await this.expresswayRepository.findOne({
        where: { NameExpressway: nameExpressway }
      });
      if (isExist) {
        throw new BadRequestException(
          this.i18n.t('expressway.NAME_TAKEN', { lang: this.lang, args: { name: nameExpressway } })
        );
      }
    }

    const expressway = this.expresswayRepository.create(data);
    return await this.expresswayRepository.save(expressway);
  }

  async findAll() {
    return await this.expresswayRepository.find({
      relations: this.commonRelations,
      order: { ExpresswayId: 'ASC' }
    });
  }

  async findOneExpressway(id: number) {
    const expressway = await this.expresswayRepository.findOne({
      where: { ExpresswayId: id },
      relations: this.commonRelations,
    });

    if (!expressway) {
      throw new NotFoundException(
        this.i18n.t('expressway.NOT_FOUND', { lang: this.lang, args: { id } }) || `Expressway with ID ${id} not found!`
      );
    }
    return expressway;
  }

  async update(id: number, data: any) {
    const expressway = await this.expresswayRepository.findOne({ where: { ExpresswayId: id } });
    if (!expressway) {
      throw new NotFoundException(
        this.i18n.t('expressway.NOT_FOUND', { lang: this.lang, args: { id } }) || `Expressway with ID ${id} not found!`
      );
    }
    const nameExpressway = data.NameExpressway || data.nameExpressway;
    if (nameExpressway !== undefined) expressway.NameExpressway = nameExpressway;
    await this.expresswayRepository.save(expressway);
    return this.findOneExpressway(id);
  }

  async remove(id: number): Promise<void> {
    const expressway = await this.expresswayRepository.findOne({ where: { ExpresswayId: id } });
    if (!expressway) {
      throw new NotFoundException(
        this.i18n.t('expressway.NOT_FOUND', { lang: this.lang, args: { id } }) || `Expressway with ID ${id} not found!`
      );
    }

    await this.expresswayRepository.delete(id);
  }
}
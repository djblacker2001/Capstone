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
    const query = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .select([
        'COUNT(DISTINCT expressway.ExpresswayId) AS totalExpressways',
        'COUNT(section.SectionId) AS totalSections',
      ])
      .addSelect('SUM(section.Length)', 'totalSystemLength')
      .addSelect("SUM(CASE WHEN section.Status = N'Complete' THEN 1 ELSE 0 END)", 'totalCompleted')
      .addSelect("SUM(CASE WHEN section.Status = N'Under construction' THEN 1 ELSE 0 END)", 'totalUnderConstruction')
      .addSelect("SUM(CASE WHEN section.Status = N'Extend under construction' THEN 1 ELSE 0 END)", 'totalExtendConstruction')
      .getRawOne();

    return {
      totalExpressways: parseInt(query.totalExpressways) || 0,
      totalSections: parseInt(query.totalSections) || 0,
      totalSystemLength: parseFloat(query.totalSystemLength) || 0,
      totalCompleted: parseInt(query.totalCompleted) || 0,
      totalUnderConstruction: parseInt(query.totalUnderConstruction) || 0,
      totalExtendConstruction: parseInt(query.totalExtendConstruction) || 0,
    };
  }

  async getExpresswayStatusSummary() {
    const individualStats = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .select('expressway.ExpresswayId', 'expresswayId')
      .addSelect('COUNT(section.SectionId)', 'totalSections')
      .addSelect("SUM(CASE WHEN section.Status = N'Complete' THEN 1 ELSE 0 END)", 'completedCount')
      .groupBy('expressway.ExpresswayId')
      .getRawMany();

    const summary = {
      hoanThanh: individualStats.filter(e => parseInt(e.completedCount) === parseInt(e.totalSections) && parseInt(e.totalSections) > 0).length,
      dangTrienKhai: individualStats.filter(e => parseInt(e.completedCount) < parseInt(e.totalSections) && parseInt(e.totalSections) > 0).length,
      chuaCoDuLieu: individualStats.filter(e => parseInt(e.totalSections) === 0).length
    };

    return summary;
  }

  async create(data: any) {
    const nameExpressway = data.NameExpressway || data.nameExpressway;
    if (nameExpressway) {
      const isExist = await this.expresswayRepository.findOne({
        where: { NameExpressway: nameExpressway }
      });
      if (isExist) {
        throw new BadRequestException(
          this.i18n.t('expressway.NAME_TAKEN', { lang: this.lang, args: { name: nameExpressway } }) || 'Expressway name already exists!'
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
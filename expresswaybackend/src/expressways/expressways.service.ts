import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway) private expresswayRepository: Repository<Expressway>,
  ) { }

  private readonly commonRelations = [
    'section',
    'section.bridge',
    'section.restStop',
    'section.interchange',
    'section.tunnel',
    'section.province'
  ];

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
      ...query,
      totalSystemLength: parseFloat(query.totalSystemLength) || 0,
      totalExpressways: parseInt(query.totalExpressways) || 0,
      totalSections: parseInt(query.totalSections) || 0,
      totalCompleted: parseInt(query.totalCompleted) || 0,
      totalUnderConstruction: parseInt(query.totalUnderConstruction) || 0,
    };
  }

  async getExpresswayStatusSummary() {
    const stats = await this.getGlobalStats();

    const summary = {
      hoanThanh: stats.filter(e => e.completedCount == e.totalSections && e.totalSections > 0).length,
      dangTrienKhai: stats.filter(e => e.completedCount < e.totalSections).length,
      chuaCoDuLieu: stats.filter(e => e.totalSections == 0).length
    };

    return summary;
  }

  create(data: any) {
    const expressway = this.expresswayRepository.create(data);
    return this.expresswayRepository.save(expressway);
  }

  findAll() {
    return this.expresswayRepository.find({
      relations: this.commonRelations,
    });
  }

  async findOneExpressway(id: number) {
    return await this.expresswayRepository.findOne({
      where: { ExpresswayId: id },
      relations: this.commonRelations,
    });
  }

  async update(id: number, data: any) {
    await this.expresswayRepository.update(id, data);
    return this.findOneExpressway(id);
  }

  async remove(id: number): Promise<void> {
    await this.expresswayRepository.delete(id);
  }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
import { Section } from "../sections/sections.entity";
import { RestStop } from "../rest-stops/rest-stops.entity";
import { Bridge } from "../bridges/bridges.entity";
import { Interchange } from "../interchanges/interchanges.entity";
import { Province } from "../provinces/provinces.entity";
import { Tunnel } from "../tunnels/tunnels.entity";

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
      // Tính tổng chiều dài dựa trên bảng Section
      .addSelect('SUM(section.Length)', 'totalSystemLength')
      .addSelect("SUM(CASE WHEN section.Status = N'Hoàn thành' THEN 1 ELSE 0 END)", 'totalCompleted')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công' THEN 1 ELSE 0 END)", 'totalUnderConstruction')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công mở rộng' THEN 1 ELSE 0 END)", 'totalExtendConstruction')
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

  async remove(id: number) {
    const expressway = await this.findOneExpressway(id);
    if (!expressway) {
      throw new NotFoundException(`Không tìm thấy cao tốc với ID ${id} để xóa`);
    }
    await this.expresswayRepository.remove(expressway);
    return {
      message: `Xóa thành công cao tốc ${expressway.NameExpressway}`,
      id: id
    };
  }
}
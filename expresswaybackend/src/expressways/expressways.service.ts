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
    @InjectRepository(Section) private sectionRepository: Repository<Section>,
    @InjectRepository(RestStop) private readonly restStopRepository: Repository<RestStop>,
    @InjectRepository(Bridge) private readonly bridgeRepository: Repository<Bridge>,
    @InjectRepository(Tunnel) private readonly tunnelRepository: Repository<Tunnel>,
    @InjectRepository(Interchange) private readonly interchangeRepository: Repository<Interchange>,
    @InjectRepository(Province) private provinceRepository: Repository<Province>,
  ) { }

  private readonly commonRelations = [
    'section',
    'section.bridge',
    'section.restStop',
    'section.interchange',
    'section.tunnel',
    'section.province'
  ];

  async findAllSections() {
    return await this.sectionRepository.find({
      relations: ['bridge', 'interchange', 'tunnel', 'province', 'restStop']
    });
  }

  async findAllRestStop() {
    return await this.restStopRepository.find({
    });
  }

  async findAllBridge() {
    return await this.bridgeRepository.find({
    });
  }

  async findAllTunnel() {
    return await this.tunnelRepository.find({
    });
  }

  async findAllInterchange() {
    return await this.interchangeRepository.find({
    });
  }

  async findAllProvince() {
    return await this.provinceRepository.find({
    });
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
      // Thực hiện đếm số lượng
      .addSelect('COUNT(DISTINCT bridge.BridgeId)', 'bridgeCount')
      .addSelect('COUNT(DISTINCT tunnel.TunnelId)', 'tunnelCount')
      .addSelect('COUNT(DISTINCT interchange.InterchangeId)', 'interchangeCount')
      .addSelect('COUNT(DISTINCT province.ProvinceId)', 'provinceCount')
      .groupBy('section.SectionId')
      .addGroupBy('section.NameSection')
      .addGroupBy('expressway.NameExpressway')
      .getRawMany(); // Dùng getRawMany để lấy kết quả từ các hàm COUNT
  }

  async getExpresswayStats() {
    return await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .select([
        'expressway.ExpresswayId AS id',
        'expressway.NameExpressway AS name',
        'expressway.TotalLength AS totalLength',
      ])
      // Đếm tổng số đoạn
      .addSelect('COUNT(section.SectionId)', 'totalSections')
      // Đếm số đoạn theo trạng thái (Dùng SUM + CASE WHEN)
      .addSelect("SUM(CASE WHEN section.Status = N'Đã hoàn thành' THEN 1 ELSE 0 END)", 'completedCount')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công' THEN 1 ELSE 0 END)", 'underConstructionCount')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công mở rộng' THEN 1 ELSE 0 END)", 'expandingCount')
      .groupBy('expressway.ExpresswayId')
      .addGroupBy('expressway.NameExpressway')
      .addGroupBy('expressway.TotalLength')
      .getRawMany();
  }

  async getGlobalStats() {
    const query = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .leftJoin('expressway.section', 'section')
      .select([
        'COUNT(DISTINCT expressway.ExpresswayId) AS totalExpressways',
        'COUNT(section.SectionId) AS totalSections',
      ])
      // SỬA Ở ĐÂY: Tính tổng chiều dài dựa trên bảng Section
      .addSelect('SUM(section.Length)', 'totalSystemLength')
      .addSelect("SUM(CASE WHEN section.Status = N'Hoàn thành' THEN 1 ELSE 0 END)", 'totalCompleted')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công' THEN 1 ELSE 0 END)", 'totalUnderConstruction')
      .addSelect("SUM(CASE WHEN section.Status = N'Đang thi công mở rộng' THEN 1 ELSE 0 END)", 'totalExtendConstruction')
      .getRawOne();

    return {
      ...query,
      // Đảm bảo các con số trả về là kiểu Number thay vì String
      totalSystemLength: parseFloat(query.totalSystemLength) || 0,
      totalExpressways: parseInt(query.totalExpressways) || 0,
      totalSections: parseInt(query.totalSections) || 0,
      totalCompleted: parseInt(query.totalCompleted) || 0,
      totalUnderConstruction: parseInt(query.totalUnderConstruction) || 0,
    };
  }

  async getExpresswayStatusSummary() {
    const stats = await this.getExpresswayStats(); // Tận dụng hàm ở bước 1

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

  async findOne(id: number) {
    return await this.expresswayRepository.findOne({
      where: { ExpresswayId: id },
      relations: this.commonRelations,
    });
  }

  async update(id: number, data: any) {
    await this.expresswayRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const expressway = await this.findOne(id);
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
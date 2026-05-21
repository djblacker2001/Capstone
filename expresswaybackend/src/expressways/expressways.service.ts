import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Like, MoreThanOrEqual, Repository } from "typeorm";
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

  async findAllSections(name?: string, status?: string, provinceName?: string) {
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

  async findAllRestStop(status?: string) {
    if (status) {
      return await this.restStopRepository.find({
        where: { Status: status }
      });
    }
    return await this.restStopRepository.find();
  }

  async findAllBridge() {
    return await this.bridgeRepository.find({
    });
  }

  async findAllTunnel() {
    return await this.tunnelRepository.find({
    });
  }

  async findAllInterchange(status?: string) {
    if (status) {
      return await this.interchangeRepository.find({
        where: { Status: status }
      });
    }
    return await this.interchangeRepository.find();
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

      .addSelect('COUNT(DISTINCT bridge.BridgeId)', 'bridgeCount')
      .addSelect('COUNT(DISTINCT tunnel.TunnelId)', 'tunnelCount')
      .addSelect('COUNT(DISTINCT interchange.InterchangeId)', 'interchangeCount')
      .addSelect('COUNT(DISTINCT province.ProvinceId)', 'provinceCount')
      .groupBy('section.SectionId')
      .addGroupBy('section.NameSection')
      .addGroupBy('expressway.NameExpressway')
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

  async findOneSection(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { SectionId: id },
      relations: ['bridge', 'interchange', 'tunnel', 'restStop', 'province'],
    });

    if (!section) {
      throw new NotFoundException(`Không tìm thấy đoạn đường với ID ${id}`);
    }
    return section;
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
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Sign } from "../signs/signs.entity";

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway)
    private expresswayRepository: Repository<Expressway>,
    private readonly i18n: I18nService,
  ) { }

  @InjectRepository(Sign)
  private readonly signRepository!: Repository<Sign>;
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

  // async getGlobalStats() {
  //   const sectionAndRestStopQuery = await this.expresswayRepository
  //     .createQueryBuilder('expressway')
  //     .leftJoin('expressway.section', 'section')
  //     .leftJoin('section.restStop', 'restStop')
  //     .select(['COUNT(DISTINCT expressway.ExpresswayId) AS totalExpressways', 'COUNT(DISTINCT section.SectionId) AS totalSections',])
  //     .addSelect('SUM(section.Length)', 'totalSystemLength')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Complete' THEN section.SectionId END)", 'totalSectionsCompleted')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Not yet under construction' THEN section.SectionId END)", 'totalSectionsNotYetUnderConstruction')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Under construction' THEN section.SectionId END)", 'totalSectionsUnderConstruction')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Extend under construction' THEN section.SectionId END)", 'totalSectionsExtendConstruction')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Incident' THEN section.SectionId END)", 'totalSectionsIncident')
  //     .addSelect("COUNT(DISTINCT CASE WHEN section.Status = N'Maintenance' THEN section.SectionId END)", 'totalSectionsMaintenance')

  //     .addSelect("COUNT(restStop.RestStopId) AS totalRestStops")
  //     .addSelect("SUM(CASE WHEN restStop.Status = N'Under construction' THEN 1 ELSE 0 END)", 'restStopUnderConstruction')
  //     .addSelect("SUM(CASE WHEN restStop.Status = N'Not yet construction' THEN 1 ELSE 0 END)", 'restStopNotYetConstruction')
  //     .addSelect("SUM(CASE WHEN restStop.Status = N'Operating' THEN 1 ELSE 0 END)", 'restStopOperating')
  //     .getRawOne();

  //   const interchangeQuery = await this.expresswayRepository
  //     .createQueryBuilder('expressway')
  //     .leftJoin('expressway.section', 'section')
  //     .leftJoin('section.interchange', 'interchange')
  //     .select([
  //       "COUNT(DISTINCT CONCAT(interchange.NameInterchange, '_', interchange.Status)) AS totalUniqueInterchanges",
  //       "COUNT(DISTINCT CASE WHEN interchange.Status = N'Under construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeUnderConstruction",
  //       "COUNT(DISTINCT CASE WHEN interchange.Status = N'Not yet construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeNotYetConstruction",
  //       "COUNT(DISTINCT CASE WHEN interchange.Status = N'Complete' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeComplete"
  //     ])
  //     .getRawOne();

  //   const bridgeAndTunnelQuery = await this.expresswayRepository
  //     .createQueryBuilder('expressway')
  //     .leftJoin('expressway.section', 'section')
  //     .leftJoin('section.bridge', 'bridge')
  //     .leftJoin('section.tunnel', 'tunnel')
  //     .select([
  //       'COUNT(DISTINCT bridge.BridgeId) AS totalBridges',
  //       'COUNT(DISTINCT tunnel.TunnelId) AS totalTunnels'
  //     ])
  //     .getRawOne();

  //   const trafficSignCount = await this.signRepository.count();

  //   return {
  //     totalExpressways: parseInt(sectionAndRestStopQuery.totalExpressways) || 0,
  //     totalSections: parseInt(sectionAndRestStopQuery.totalSections) || 0,
  //     totalSystemLength: parseFloat(sectionAndRestStopQuery.totalSystemLength) || 0,
  //     totalSectionsCompleted: parseInt(sectionAndRestStopQuery.totalSectionsCompleted) || 0,
  //     totalSectionsNotYetUnderConstruction: parseInt(sectionAndRestStopQuery.totalSectionsNotYetUnderConstruction) || 0,
  //     totalSectionsUnderConstruction: parseInt(sectionAndRestStopQuery.totalSectionsUnderConstruction) || 0,
  //     totalSectionsExtendConstruction: parseInt(sectionAndRestStopQuery.totalSectionsExtendConstruction) || 0,
  //     totalSectionsIncident: parseInt(sectionAndRestStopQuery.totalSectionsIncident) || 0,
  //     totalSectionsMaintenance: parseInt(sectionAndRestStopQuery.totalSectionsMaintenance) || 0,

  //     totalRestStops: parseInt(sectionAndRestStopQuery.totalRestStops) || 0,
  //     restStopUnderConstruction: parseInt(sectionAndRestStopQuery.restStopUnderConstruction) || 0,
  //     restStopNotYetConstruction: parseInt(sectionAndRestStopQuery.restStopNotYetConstruction) || 0,
  //     restStopOperating: parseInt(sectionAndRestStopQuery.restStopOperating) || 0,

  //     totalUniqueInterchanges: parseInt(interchangeQuery.totalUniqueInterchanges) || 0,
  //     interchangeUnderConstruction: parseInt(interchangeQuery.interchangeUnderConstruction) || 0,
  //     interchangeNotYetConstruction: parseInt(interchangeQuery.interchangeNotYetConstruction) || 0,
  //     interchangeComplete: parseInt(interchangeQuery.interchangeComplete) || 0,

  //     totalBridges: parseInt(bridgeAndTunnelQuery.totalBridges) || 0,
  //     totalTunnels: parseInt(bridgeAndTunnelQuery.totalTunnels) || 0,
  //     totalSigns: trafficSignCount || 0,
  //   };
  // }

  async getGlobalStats() {
    // 1. Query thống kê Tuyến đường & Phân đoạn (Đảm bảo SUM(Length) chính xác 100%)
    const sectionStats = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .select([
        'COUNT(DISTINCT section.ExpresswayId) AS totalExpressways',
        'COUNT(section.SectionId) AS totalSections',
        'SUM(section.Length) AS totalSystemLength',
        "COUNT(CASE WHEN section.Status = N'Complete' THEN 1 END) AS totalSectionsCompleted",
        "COUNT(CASE WHEN section.Status = N'Not yet under construction' THEN 1 END) AS totalSectionsNotYetUnderConstruction",
        "COUNT(CASE WHEN section.Status = N'Under construction' THEN 1 END) AS totalSectionsUnderConstruction",
        "COUNT(CASE WHEN section.Status = N'Extend under construction' THEN 1 END) AS totalSectionsExtendConstruction",
        "COUNT(CASE WHEN section.Status = N'Incident' THEN 1 END) AS totalSectionsIncident",
        "COUNT(CASE WHEN section.Status = N'Maintenance' THEN 1 END) AS totalSectionsMaintenance",
      ])
      .getRawOne();

    // 2. Query thống kê Trạm dừng nghỉ
    const restStopStats = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .select([
        'COUNT(restStop.RestStopId) AS totalRestStops',
        "SUM(CASE WHEN restStop.Status = N'Under construction' THEN 1 ELSE 0 END) AS restStopUnderConstruction",
        "SUM(CASE WHEN restStop.Status = N'Not yet construction' THEN 1 ELSE 0 END) AS restStopNotYetConstruction",
        "SUM(CASE WHEN restStop.Status = N'Operating' THEN 1 ELSE 0 END) AS restStopOperating",
      ])
      .getRawOne();

    // 3. Query thống kê Nút giao (Interchange)
    const interchangeStats = await this.expresswayRepository
      .createQueryBuilder('expressway')
      .select([
        "COUNT(DISTINCT CONCAT(interchange.NameInterchange, '_', interchange.Status)) AS totalUniqueInterchanges",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Under construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeUnderConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Not yet construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeNotYetConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Complete' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeComplete",
      ])
      .getRawOne();

    // 4. Query đếm Cầu, Hầm và Biển báo (Chạy song song bằng Promise.all để tăng tốc độ API)
    const [bridgeCount, tunnelCount, trafficSignCount] = await Promise.all([
      this.expresswayRepository.count(),
      this.expresswayRepository.count(),
      this.signRepository.count(),
    ]);

    // 5. Trả về kết quả
    return {
      totalExpressways: parseInt(sectionStats?.totalExpressways) || 0,
      totalSections: parseInt(sectionStats?.totalSections) || 0,
      totalSystemLength: parseFloat(sectionStats?.totalSystemLength) || 0,
      totalSectionsCompleted: parseInt(sectionStats?.totalSectionsCompleted) || 0,
      totalSectionsNotYetUnderConstruction: parseInt(sectionStats?.totalSectionsNotYetUnderConstruction) || 0,
      totalSectionsUnderConstruction: parseInt(sectionStats?.totalSectionsUnderConstruction) || 0,
      totalSectionsExtendConstruction: parseInt(sectionStats?.totalSectionsExtendConstruction) || 0,
      totalSectionsIncident: parseInt(sectionStats?.totalSectionsIncident) || 0,
      totalSectionsMaintenance: parseInt(sectionStats?.totalSectionsMaintenance) || 0,

      totalRestStops: parseInt(restStopStats?.totalRestStops) || 0,
      restStopUnderConstruction: parseInt(restStopStats?.restStopUnderConstruction) || 0,
      restStopNotYetConstruction: parseInt(restStopStats?.restStopNotYetConstruction) || 0,
      restStopOperating: parseInt(restStopStats?.restStopOperating) || 0,

      totalUniqueInterchanges: parseInt(interchangeStats?.totalUniqueInterchanges) || 0,
      interchangeUnderConstruction: parseInt(interchangeStats?.interchangeUnderConstruction) || 0,
      interchangeNotYetConstruction: parseInt(interchangeStats?.interchangeNotYetConstruction) || 0,
      interchangeComplete: parseInt(interchangeStats?.interchangeComplete) || 0,

      totalBridges: bridgeCount || 0,
      totalTunnels: tunnelCount || 0,
      totalSigns: trafficSignCount || 0,
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
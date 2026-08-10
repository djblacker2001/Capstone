import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
import { Section } from "../sections/sections.entity";
import { RestStop } from "../rest-stops/rest-stops.entity";
import { Interchange } from "../interchanges/interchanges.entity";
import { Bridge } from "../bridges/bridges.entity";
import { Tunnel } from "../tunnels/tunnels.entity";
import { Sign } from "../signs/signs.entity";
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway)
    private readonly expresswayRepository: Repository<Expressway>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(RestStop)
    private readonly restStopRepository: Repository<RestStop>,
    @InjectRepository(Interchange)
    private readonly interchangeRepository: Repository<Interchange>,
    @InjectRepository(Bridge)
    private readonly bridgeRepository: Repository<Bridge>,
    @InjectRepository(Tunnel)
    private readonly tunnelRepository: Repository<Tunnel>,
    @InjectRepository(Sign)
    private readonly signRepository: Repository<Sign>,
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
    const sectionStats = await this.sectionRepository
      .createQueryBuilder('section')
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

    const restStopStats = await this.restStopRepository
      .createQueryBuilder('restStop')
      .select([
        'COUNT(restStop.RestStopId) AS totalRestStops',
        "SUM(CASE WHEN restStop.Status = N'Under construction' THEN 1 ELSE 0 END) AS restStopUnderConstruction",
        "SUM(CASE WHEN restStop.Status = N'Not yet construction' THEN 1 ELSE 0 END) AS restStopNotYetConstruction",
        "SUM(CASE WHEN restStop.Status = N'Operating' THEN 1 ELSE 0 END) AS restStopOperating",
      ])
      .getRawOne();

    const interchangeStats = await this.interchangeRepository
      .createQueryBuilder('interchange')
      .select([
        "COUNT(DISTINCT CONCAT(interchange.NameInterchange, '_', interchange.Status)) AS totalUniqueInterchanges",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Under construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeUnderConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Not yet construction' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeNotYetConstruction",
        "COUNT(DISTINCT CASE WHEN interchange.Status = N'Complete' THEN CONCAT(interchange.NameInterchange, '_', interchange.Status) END) AS interchangeComplete",
      ])
      .getRawOne();

    const [bridgeCount, tunnelCount, trafficSignCount] = await Promise.all([
      this.bridgeRepository.count(),
      this.tunnelRepository.count(),
      this.signRepository.count(),
    ]);

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
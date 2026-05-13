import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './sections.entity';
import { RestStop } from '../rest-stops/rest-stops.entity';
import { Bridge } from '../bridges/bridges.entity';
import { Interchange } from '../interchanges/interchanges.entity';
import { Province } from '../provinces/provinces.entity';
import { Tunnel } from '../tunnels/tunnels.entity';

@Injectable()
export class SectionsService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(RestStop)
        private readonly restStopRepository: Repository<RestStop>,
        @InjectRepository(Bridge)
        private readonly bridgeRepository: Repository<Bridge>,
        @InjectRepository(Tunnel)
        private readonly tunnelRepository: Repository<Tunnel>,
        @InjectRepository(Interchange)
        private readonly interchangeRepository: Repository<Interchange>,
        @InjectRepository(Province)
        private provinceRepository: Repository<Province>,

    ) { }

    findAll() {
        return this.sectionRepository.find({
            relations: ['expressway', 'bridge', 'interchange', 'tunnel', 'restStop', 'province']
        });
    }

    async findAllRestStop() {
        return await this.restStopRepository.find({
            relations: []
        });
    }

    async findAllBridge() {
        return await this.bridgeRepository.find({
            relations: []
        });
    }

    async findAllTunnel() {
        return await this.bridgeRepository.find({
            relations: []
        });
    }

    async findAllInterchange() {
        return await this.bridgeRepository.find({
            relations: []
        });
    }

    async findAllProvince() {
        return await this.bridgeRepository.find({
            relations: []
        });
    }

    async findOne(id: number): Promise<Section> {
        const section = await this.sectionRepository.findOne({
            where: { SectionId: id },
            relations: ['expressway', 'bridge', 'interchange'],
        });

        if (!section) {
            throw new NotFoundException(`Không tìm thấy đoạn đường với ID ${id}`);
        }
        return section;
    }

    async create(data: Partial<Section>): Promise<Section> {
        const newSection = this.sectionRepository.create(data);
        return await this.sectionRepository.save(newSection);
    }

    async update(id: number, data: Partial<Section>): Promise<Section> {
        await this.sectionRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.sectionRepository.delete(id);
    }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestStop } from './rest-stops.entity';

@Injectable()
export class RestStopsService {
    constructor(
        @InjectRepository(RestStop)
        private readonly restStopRepository: Repository<RestStop>,
    ) { }

    async findAll(): Promise<RestStop[]> {
        return await this.restStopRepository.find({
            relations: ['section']
        });
    }

    async findOne(sectionId: number): Promise<RestStop> {
        const restStop = await this.restStopRepository.findOne({
            where: { SectionId: sectionId },
            relations: ['section']
        });

        if (!restStop) {
            throw new NotFoundException(`Đoạn đường này hiện chưa có trạm dừng nghỉ.`);
        }
        return restStop;
    }

    create(data: Partial<RestStop>): Promise<RestStop> {
        const newRestStop = this.restStopRepository.create(data);
        return this.restStopRepository.save(newRestStop);
    }

    async update(id: number, data: Partial<RestStop>): Promise<RestStop> {
        await this.restStopRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.restStopRepository.delete(id);
    }
}
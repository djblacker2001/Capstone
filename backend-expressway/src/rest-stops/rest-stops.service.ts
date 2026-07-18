import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestStop } from './rest-stops.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class RestStopsService {
    constructor(
        @InjectRepository(RestStop)
        private readonly restStopRepository: Repository<RestStop>,
        private readonly i18n: I18nService,
    ) { }

    async findAllRestStops(status?: string): Promise<RestStop[]> {
        return await this.restStopRepository.find({
            where: status ? { Status: status } : {},
        });
    }

    private get lang(): string {
        return I18nContext.current()?.lang || 'en';
    }

    async findOne(sectionId: number): Promise<RestStop> {
        const restStop = await this.restStopRepository.findOne({
            where: { SectionId: sectionId },
        });

        if (!restStop) {
            throw new NotFoundException(
                this.i18n.t('rest_stop.NOT_FOUND', { lang: this.lang })
            );
        }
        return restStop;
    }

    async create(data: Partial<RestStop>): Promise<RestStop> {
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
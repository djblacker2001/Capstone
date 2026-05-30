import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bridge } from './bridges.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class BridgesService {
    constructor(
        @InjectRepository(Bridge)
        private readonly bridgeRepository: Repository<Bridge>,
        private readonly i18n: I18nService,
    ) { }

    findAll(): Promise<Bridge[]> {
        return this.bridgeRepository.find({ relations: ['section'] });
    }

    private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findOne(id: number): Promise<Bridge> {
    const bridge = await this.bridgeRepository.findOne({
      where: { BridgeId: id },
      relations: ['section']
    });

    if (!bridge) {
      throw new NotFoundException(
        this.i18n.t('bridge.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    return bridge;
  }

    create(data: Partial<Bridge>): Promise<Bridge> {
        const newBridge = this.bridgeRepository.create(data);
        return this.bridgeRepository.save(newBridge);
    }

    async update(id: number, data: Partial<Bridge>): Promise<Bridge> {
        await this.bridgeRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.bridgeRepository.delete(id);
    }
}
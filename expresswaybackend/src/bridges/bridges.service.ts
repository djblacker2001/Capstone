import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bridge } from './bridges.entity';

@Injectable()
export class BridgesService {
    constructor(
        @InjectRepository(Bridge)
        private readonly bridgeRepository: Repository<Bridge>,
    ) { }

    findAll(): Promise<Bridge[]> {
        return this.bridgeRepository.find({ relations: ['section'] });
    }

    async findOne(id: number): Promise<Bridge> {
        const bridge = await this.bridgeRepository.findOne({
            where: { BridgeId: id },
            relations: ['section']
        });
        if (!bridge) throw new NotFoundException(`Không tìm thấy cầu với ID ${id}`);
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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tunnel } from './tunnels.entity';

@Injectable()
export class TunnelsService {
  constructor(
    @InjectRepository(Tunnel)
    private readonly tunnelRepository: Repository<Tunnel>,
  ) {}

  findAll(): Promise<Tunnel[]> {
    return this.tunnelRepository.find({ relations: ['section'] });
  }

  async findOne(id: number): Promise<Tunnel> {
    const tunnel = await this.tunnelRepository.findOne({ 
      where: { TunnelId: id },
      relations: ['section'] 
    });
    if (!tunnel) throw new NotFoundException(`Không tìm thấy hầm với ID ${id}`);
    return tunnel;
  }

  create(data: Partial<Tunnel>): Promise<Tunnel> {
    const newTunnel = this.tunnelRepository.create(data);
    return this.tunnelRepository.save(newTunnel);
  }

  async update(id: number, data: Partial<Tunnel>): Promise<Tunnel> {
    await this.tunnelRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tunnelRepository.delete(id);
  }
}
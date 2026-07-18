import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tunnel } from './tunnels.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class TunnelsService {
  constructor(
    @InjectRepository(Tunnel)
    private readonly tunnelRepository: Repository<Tunnel>,
    private readonly i18n: I18nService,
  ) {}

  findAll(): Promise<Tunnel[]> {
    return this.tunnelRepository.find({
    });
  }

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }

  async findOne(id: number): Promise<Tunnel> {
    const tunnel = await this.tunnelRepository.findOne({ 
      where: { TunnelId: id },
      relations: ['section'] 
    });
    
    if (!tunnel) {
      throw new NotFoundException(
        this.i18n.t('tunnel.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
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
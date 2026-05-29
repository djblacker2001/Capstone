import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interchange } from './interchanges.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class InterchangesService {
  constructor(
    @InjectRepository(Interchange)
    private readonly interchangeRepository: Repository<Interchange>,
    private readonly i18n: I18nService,
    
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang || 'en';
  }
  
  async findAll(): Promise<Interchange[]> {
    return await this.interchangeRepository.find({
    });
  }

  async findBySection(sectionId: number): Promise<Interchange[]> {
    return await this.interchangeRepository.find({
      where: { SectionId: sectionId }
    });
  }

  async create(data: Partial<Interchange>): Promise<Interchange> {
    const newInterchange = this.interchangeRepository.create(data);
    return await this.interchangeRepository.save(newInterchange);
  }

  async update(id: number, data: Partial<Interchange>): Promise<Interchange> {
    await this.interchangeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.interchangeRepository.delete(id);
  }

  async findOne(id: number): Promise<Interchange> {
    const interchange = await this.interchangeRepository.findOne({ where: { InterchangeId: id } });
    
    if (!interchange) {
      throw new NotFoundException(
        this.i18n.t('interchange.NOT_FOUND', { lang: this.lang, args: { id } })
      );
    }
    
    return interchange;
  }
}
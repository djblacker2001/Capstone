import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";
import { Section } from "../sections/sections.entity";
import { RestStop } from "../rest-stops/rest-stops.entity";

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway) private repo: Repository<Expressway>,
    @InjectRepository(Section) private sectionRepo: Repository<Section>,
  ) { }

  private readonly commonRelations = [
    'section',
    'section.bridge',
    'section.restStop',
    'section.interchange',
    'section.tunnel',
    'section.province'
  ];

  async findAllSections() {
    return await this.sectionRepo.find({
      relations: ['bridge', 'interchange', 'tunnel', 'province', 'restStop'] 
    });
  }

  create(data: any) {
    const expressway = this.repo.create(data);
    return this.repo.save(expressway);
  }

  findAll() {
    return this.repo.find({
      relations: this.commonRelations,
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: { ExpresswayId: id },
      relations: this.commonRelations,
    });
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const expressway = await this.findOne(id);
    if (!expressway) {
      throw new NotFoundException(`Không tìm thấy cao tốc với ID ${id} để xóa`);
    }
    await this.repo.remove(expressway);
    return {
      message: `Xóa thành công cao tốc ${expressway.NameExpressway}`,
      id: id
    };
  }
}
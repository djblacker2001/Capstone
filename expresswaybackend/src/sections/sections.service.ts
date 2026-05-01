import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSectionDto } from "./dto/create-section.dto";
import { Section } from "./section.entity";

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private repo: Repository<Section>,
  ) {}

  create(dto: CreateSectionDto) {
    const section = this.repo.create({
      ...dto,
      mapData: JSON.stringify(dto.mapData),
    });

    return this.repo.save(section);
  }

  findAll() {
    return this.repo.find();
  }
}
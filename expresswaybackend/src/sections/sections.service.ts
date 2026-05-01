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
    ) { }

    create(dto) {
        return this.repo.save(
            this.repo.create({
                ...dto,
                mapData: JSON.stringify(dto.mapData),
            }),
        );
    }

    findAll() {
        return this.repo.find().then(data =>
            data.map(item => ({
                ...item,
                mapData: JSON.parse(item.mapData || '[]'),
            })),
        );
    }
}
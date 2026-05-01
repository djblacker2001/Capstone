import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expressway } from "./expressways.entity";

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway)
    private repo: Repository<Expressway>,
  ) {}

  create(data) {
    return this.repo.save(this.repo.create(data));
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ ExpresswayId: id });
  }

  update(id: number, data) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
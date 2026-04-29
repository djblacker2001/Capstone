import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expressway } from './expressway.entity';

@Injectable()
export class ExpresswaysService {
  constructor(
    @InjectRepository(Expressway)
    private repo: Repository<Expressway>,
  ) {}

  findAll() {
    return this.repo.find();
  }
}

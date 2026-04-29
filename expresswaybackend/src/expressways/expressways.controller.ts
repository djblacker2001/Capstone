import { Controller, Get } from '@nestjs/common';
import { ExpresswaysService } from './expressways.service';

@Controller('expressways')
export class ExpresswaysController {
  constructor(private service: ExpresswaysService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }
}

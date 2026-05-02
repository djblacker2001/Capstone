import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BridgesService } from './bridges.service';
import { Bridge } from './bridges.entity';

@Controller('bridges')
export class BridgesController {
  constructor(private readonly bridgesService: BridgesService) {}

  @Get()
  findAll() {
    return this.bridgesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bridgesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Bridge>) {
    return this.bridgesService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Bridge>) {
    return this.bridgesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bridgesService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RestStopsService } from './rest-stops.service';
import { RestStop } from './rest-stops.entity';

@Controller('rest-stops')
export class RestStopsController {
  constructor(private readonly restStopsService: RestStopsService) {}

  @Get()
  findAll() {
    return this.restStopsService.findAllRestStops();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restStopsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<RestStop>) {
    return this.restStopsService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<RestStop>) {
    return this.restStopsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restStopsService.remove(id);
  }
}
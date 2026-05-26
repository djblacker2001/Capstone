import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RestStopsService } from './rest-stops.service';
import { RestStop } from './rest-stops.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateRestStopDto } from './dto/create-rest-stops.dto';
import { UpdateRestStopDto } from './dto/update-rest-stops.dto';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createRestStopDto: CreateRestStopDto) {
    return this.restStopsService.create(createRestStopDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRestStopDto: UpdateRestStopDto) {
    return this.restStopsService.update(id, updateRestStopDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restStopsService.remove(id);
  }
}
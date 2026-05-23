/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InterchangesService } from './interchanges.service';
import { Interchange } from './interchanges.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('interchanges')
export class InterchangesController {
  constructor(private readonly interchangesService: InterchangesService) {}

  @Get()
  findAll() {
    return this.interchangesService.findAll();
  }

  @Get('section/:sectionId')
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.interchangesService.findBySection(sectionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.interchangesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() data: Partial<Interchange>) {
    return this.interchangesService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Interchange>) {
    return this.interchangesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.interchangesService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InterchangesService } from './interchanges.service';
import { Interchange } from './interchanges.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateInterchangeDto } from './dto/create-interchanges.dto';
import { UpdateInterchangeDto } from './dto/update-interchanges.dto';

@ApiBearerAuth()
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
  create(@Body() createInterchangeDto: CreateInterchangeDto) {
    return this.interchangesService.create(createInterchangeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateInterchangeDto: UpdateInterchangeDto) {
    return this.interchangesService.update(id, updateInterchangeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.interchangesService.remove(id);
  }
}
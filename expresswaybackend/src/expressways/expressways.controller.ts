import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ExpresswaysService } from './expressways.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateExpresswayDto } from './dto/create-expressways.dto';
import { UpdateExpresswayDto } from './dto/update-expressways.dto';

@ApiTags('Expressway')
@ApiBearerAuth()
@Controller('expressways')
export class ExpresswaysController {
  constructor(private expresswaysService: ExpresswaysService) { }

  @Get()
  findAll() {
    return this.expresswaysService.findAll();
  }

  @Get('statistics')
  async getOverview() {
    return this.expresswaysService.getGlobalStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.findOneExpressway(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createExpresswayDto: CreateExpresswayDto) {
    return this.expresswaysService.create(createExpresswayDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpresswayDto: UpdateExpresswayDto) {
    return this.expresswaysService.update(id, updateExpresswayDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.remove(id);
  }
}

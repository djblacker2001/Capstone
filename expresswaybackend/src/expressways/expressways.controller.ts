import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ExpresswaysService } from './expressways.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('expressways')
export class ExpresswaysController {
  constructor(private expresswaysService: ExpresswaysService) { }

  @Post()
  create(@Body() data: any) {
    return this.expresswaysService.create(data);
  }

  @Get('sections')
  async getAllSections() {
    return this.expresswaysService.findAllSections();
  }

  @Get('sections/rest-stops')
  async getAllRestStop() {
    return this.expresswaysService.findAllRestStop();
  }

  @Get('sections/interchanges')
  async getAllInterchange() {
    return this.expresswaysService.findAllInterchange();
  }

  @Get('sections/tunnels')
  async getAllTunnel() {
    return this.expresswaysService.findAllTunnel();
  }

  @Get('sections/bridges')
  async getAllBridge() {
    return this.expresswaysService.findAllBridge();
  }

  @Get('sections/provinces')
  async getAllProvince() {
    return this.expresswaysService.findAllProvince();
  }

  @Get('sections/statistics')
  async getStats() {
    return this.expresswaysService.getSectionStatistics();
  }

  @Get('statistics')
  async getOverview() {
    return this.expresswaysService.getGlobalStats();
  }

  @Get('statistics/expressway')
  async getByExpressway() {
    return this.expresswaysService.getExpresswayStats();
  }

  @Get()
  findAll() {
    return this.expresswaysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.expresswaysService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createExpressway() {
    return 'Create expressway (admin only)';
  }
}

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
  constructor(private service: ExpresswaysService) { }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get('sections')
  async getAllSections() {
    return this.service.findAllSections();
  }

  @Get('sections/rest-stops')
  async getAllRestStop() {
    return this.service.findAllRestStop();
  }

  @Get('sections/interchanges')
  async getAllInterchange() {
    return this.service.findAllInterchange();
  }

  @Get('sections/tunnels')
  async getAllTunnel() {
    return this.service.findAllTunnel();
  }

  @Get('sections/bridges')
  async getAllBridge() {
    return this.service.findAllBridge();
  }

  @Get('sections/provinces')
  async getAllProvince() {
    return this.service.findAllProvince();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createExpressway() {
    return 'Create expressway (admin only)';
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { SignsService } from './signs.service';
import { Sign } from './signs.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('signs')
export class SignsController {
  constructor(private readonly signsService: SignsService) {}

  @Get('search')
  async searchSigns(@Query('description') description: string) {
    return await this.signsService.searchByDescription(description);
  }
  
  @Get()
  findAll() {
    return this.signsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.signsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() signData: Partial<Sign>) {
    return this.signsService.create(signData);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() signData: Partial<Sign>) {
    return this.signsService.update(id, signData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signsService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SignsService } from './signs.service';
import { Sign } from './signs.entity';

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

  @Post()
  create(@Body() signData: Partial<Sign>) {
    return this.signsService.create(signData);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() signData: Partial<Sign>) {
    return this.signsService.update(id, signData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signsService.remove(id);
  }
}
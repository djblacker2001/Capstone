import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Interchange } from '../interchanges/interchanges.entity';
import { Province } from './provinces.entity';
import { CreateProvinceDto } from './dto/create-provinces.dto';
import { UpdateProvinceDto } from './dto/update-provinces.dto';

@ApiBearerAuth()
@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get()
  findAll() {
    return this.provincesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.findOneProvince(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createProvinceDto: CreateProvinceDto) {
    return this.provincesService.create(createProvinceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProvinceDto: UpdateProvinceDto) {
    return this.provincesService.update(id, updateProvinceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.provincesService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { Section } from './sections.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiQuery } from '@nestjs/swagger';
import { CreateSectionDto } from './dto/create-sections.dto';
import { UpdateSectionDto } from './dto/update-sections.dto';


@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  @Get()
  async getAll() {
    return await this.sectionsService.findAll();
  }

  @Get('search')
  @ApiQuery({ name: 'name', required: false, type: String,})
  @ApiQuery({ name: 'status', required: false, type: String,})
  @ApiQuery({ name: 'provinceName', required: false, type: String,})
  async getAllSections(
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('provinceName') provinceName?: string,
  ) {
    return await this.sectionsService.findAllSection(name, status, provinceName);
  }

  @Get('search-by-km')
  async searchByKm(@Query('km') km: string) {
    const kmNumber = parseFloat(km);

    if (isNaN(kmNumber)) {
      return {
        success: false,
        statusCode: 400,
        message: 'Vui lòng nhập vị trí Km hợp lệ (phải là một con số)!',
        data: null
      };
    }

    return this.sectionsService.findSectionByKm(kmNumber);
  }

  @Get(':id')
  async getSectionDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionsService.findOne(id);
  }

  @Get('statistics')
  async getStats() {
    return this.sectionsService.getSectionStatistics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createSection(@Body() sectionCreateDto: CreateSectionDto) {
    return await this.sectionsService.create(sectionCreateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return await this.sectionsService.update(+id, updateSectionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
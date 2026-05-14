import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { Section } from './sections.entity';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  @Get()
  async getAllSections() {
    return await this.sectionsService.findAll();
  }

  @Get(':id')
  async getSectionDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionsService.findOne(id);
  }

  @Post()
  async createSection(@Body() sectionData: Partial<Section>) {
    return await this.sectionsService.create(sectionData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSectionDto: Partial<Section>) {
    return await this.sectionsService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sectionsService.remove(+id);
  }
}
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

  @Get('sections')
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by section name' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by section status' })
  @ApiQuery({ name: 'provinceName', required: false, type: String, description: 'Filter by province' })
  async getAllSections(
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('provinceName') provinceName?: string,
  ) {
    return await this.expresswaysService.findAllSections(name, status, provinceName);
  }

  @Get('sections/rest-stops')
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by rest-stop status' })
  async getAllRestStop(@Query('status') status?: string) {
    return this.expresswaysService.findAllRestStop(status);
  }

  @Get('sections/interchanges')
  async getAllInterchange(@Query('status') status?: string) {
    return this.expresswaysService.findAllInterchange(status);
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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.findOneExpressway(id);
  }

  @Get('sections/search-by-km')
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

    return this.expresswaysService.findSectionByKm(kmNumber);
  }

  @Get('sections/:id')
  async getSectionDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.expresswaysService.findOneSection(id);
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

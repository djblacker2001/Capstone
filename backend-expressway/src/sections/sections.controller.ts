import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { CreateSectionDto } from './dto/create-sections.dto';
import { UpdateSectionDto } from './dto/update-sections.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

const sectionMulterStorage = diskStorage({
  destination: (req, file, cb) => {
    const isJson = extname(file.originalname).toLowerCase() === '.json';
    const folderPath = isJson ? './uploads/maps' : './uploads/ways';

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    const isJson = extname(file.originalname).toLowerCase() === '.json';

    if (isJson) {
      cb(null, `${Date.now()}-${file.originalname}`);
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `img-${uniqueSuffix}${extname(file.originalname)}`);
    }
  },
});

@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  @Get()
  async getAll() {
    return await this.sectionsService.findAll();
  }

  @Get('search')
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'provinceName', required: false, type: String })
  async getAllSections(
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('provinceName') provinceName?: string,
  ) {
    return await this.sectionsService.findAllSection(name, status, provinceName);
  }

  @Get('kilometre')
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

  @Get('statistics')
  async getStats() {
    return this.sectionsService.getSectionStatistics();
  }

  @Get(':id')
  async getSectionDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionsService.findOneSection(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'Image', maxCount: 1 },
      { name: 'SpeedSign', maxCount: 1 },
      { name: 'MapData', maxCount: 1 },
    ], { storage: sectionMulterStorage })
  )
  async create(
    @Body() createSectionDto: CreateSectionDto,
    @UploadedFiles() files: {
      Image?: Express.Multer.File[];
      SpeedSign?: Express.Multer.File[];
      MapData?: Express.Multer.File[];
    }
  ) {
    const imagePath = files?.Image?.[0] ? files.Image[0].path.replace(/\\/g, '/') : undefined;
    const speedSignPath = files?.SpeedSign?.[0] ? files.SpeedSign[0].path.replace(/\\/g, '/') : undefined;
    const mapPath = files?.MapData?.[0] ? files.MapData[0].path.replace(/\\/g, '/') : undefined;

    const dataPayload = {
      ...createSectionDto,
      Image: imagePath,
      SpeedSign: speedSignPath,
      MapData: mapPath,
    };

    return this.sectionsService.create(dataPayload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'Image', maxCount: 1 },
      { name: 'SpeedSign', maxCount: 1 },
      { name: 'MapData', maxCount: 1 },
    ], { storage: sectionMulterStorage })
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @UploadedFiles() files: {
      Image?: Express.Multer.File[];
      SpeedSign?: Express.Multer.File[];
      MapData?: Express.Multer.File[];
    }
  ) {
    const newImagePath = files?.Image?.[0] ? files.Image[0].path.replace(/\\/g, '/') : undefined;
    const newSpeedSignPath = files?.SpeedSign?.[0] ? files.SpeedSign[0].path.replace(/\\/g, '/') : undefined;
    const newMapPath = files?.MapData?.[0] ? files.MapData[0].path.replace(/\\/g, '/') : undefined;

    return this.sectionsService.updateSectionWithFiles(
      id,
      updateSectionDto,
      newImagePath,
      newSpeedSignPath,
      newMapPath
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.remove(id);
  }
}
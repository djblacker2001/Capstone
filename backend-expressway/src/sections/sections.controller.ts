import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { CreateSectionDto } from './dto/create-sections.dto';
import { UpdateSectionDto } from './dto/update-sections.dto';
import { memoryStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

function buildCleanFilename(file: Express.Multer.File): string {
  const cleanName = Buffer.from(file.originalname || 'file', 'latin1')
    .toString('utf8')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '-');

  const randomPrefix = Math.random().toString(36).substring(2, 6);
  return `${randomPrefix}-${cleanName}`;
}

const getRelativeUploadPath = (
  file: Express.Multer.File | undefined,
  subFolder: 'ways' | 'maps' | 'signs',
) => {
  if (!file) return undefined;
  return `uploads/${subFolder}/${buildCleanFilename(file)}`;
};

@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

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
        data: null,
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
    FileFieldsInterceptor(
      [
        { name: 'Image', maxCount: 1 },
        { name: 'SpeedSign', maxCount: 1 },
        { name: 'MapData', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async create(
    @Body() createSectionDto: CreateSectionDto,
    @UploadedFiles()
    files: {
      Image?: Express.Multer.File[];
      SpeedSign?: Express.Multer.File[];
      MapData?: Express.Multer.File[];
    },
  ) {
    const imagePath = getRelativeUploadPath(files?.Image?.[0], 'ways');
    const speedSignPath = getRelativeUploadPath(files?.SpeedSign?.[0], 'signs');
    const mapPath = getRelativeUploadPath(files?.MapData?.[0], 'maps');

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
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'Image', maxCount: 1 },
        { name: 'SpeedSign', maxCount: 1 },
        { name: 'MapData', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @UploadedFiles()
    files: {
      Image?: Express.Multer.File[];
      SpeedSign?: Express.Multer.File[];
      MapData?: Express.Multer.File[];
    },
  ) {
    console.log('>>> [CONTROLLER FILES]:', files);
    const newImagePath = getRelativeUploadPath(files?.Image?.[0], 'ways');
    const newSpeedSignPath = getRelativeUploadPath(
      files?.SpeedSign?.[0],
      'signs',
    );
    const newMapPath = getRelativeUploadPath(files?.MapData?.[0], 'maps');

    return this.sectionsService.updateSectionWithFiles(
      id,
      updateSectionDto,
      newImagePath,
      newSpeedSignPath,
      newMapPath,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.remove(id);
  }
}
import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete, Query, UseGuards, UseInterceptors, UploadedFiles} from '@nestjs/common';
import { ExpresswaysService } from './expressways.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateExpresswayDto } from './dto/create-expressways.dto';
import { UpdateExpresswayDto } from './dto/update-expressways.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

const expresswayMulterStorage = diskStorage({
  destination: (req, file, cb) => {
    console.log('>>> [MULTER RUNNING - EXPRESSWAY] Đang xử lý file:', file.fieldname, file.originalname);
    let subFolder = 'expressways';
    if (file.fieldname === 'MapData') {
      subFolder = 'maps';
    }

    const absolutePath = join(process.cwd(), 'uploads', subFolder);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }

    cb(null, absolutePath);
  },

  filename: (req, file, cb) => {
    const cleanName = Buffer.from(file.originalname, 'latin1')
      .toString('utf8')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/\s+/g, '-');

    const randomPrefix = Math.random().toString(36).substring(2, 6);
    cb(null, `${randomPrefix}-${cleanName}`);
  },
});

const getRelativeUploadPath = (file?: Express.Multer.File) => {
  if (!file) return undefined;
  const normalizedPath = file.path.replace(/\\/g, '/');
  const uploadIndex = normalizedPath.indexOf('uploads/');
  return uploadIndex !== -1 ? normalizedPath.substring(uploadIndex) : normalizedPath;
};

@ApiTags('Expressway')
@ApiBearerAuth()
@Controller('expressways')
export class ExpresswaysController {
  constructor(private expresswaysService: ExpresswaysService) { }

  @Get()
  findAll() {
    return this.expresswaysService.findAll();
  }

  @Get('statistics')
  async getOverview() {
    return this.expresswaysService.getGlobalStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.findOneExpressway(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'MapData', maxCount: 1 },
    ], { storage: expresswayMulterStorage })
  )
  async create(
    @Body() createExpresswayDto: CreateExpresswayDto,
    @UploadedFiles() files: { MapData?: Express.Multer.File[] }
  ) {
    const mapPath = getRelativeUploadPath(files?.MapData?.[0]);

    const dataPayload = {
      ...createExpresswayDto,
      MapData: mapPath,
    };

    return this.expresswaysService.create(dataPayload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'MapData', maxCount: 1 },
    ], { storage: expresswayMulterStorage })
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpresswayDto: UpdateExpresswayDto,
    @UploadedFiles() files: { MapData?: Express.Multer.File[] }
  ) {
    const newMapPath = getRelativeUploadPath(files?.MapData?.[0]);

    const dataPayload = {
      ...updateExpresswayDto,
      ...(newMapPath && { MapData: newMapPath }),
    };

    return this.expresswaysService.update(id, dataPayload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expresswaysService.remove(id);
  }
}
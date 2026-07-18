import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SignsService } from './signs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSignDto } from './dto/create-signs.dto';
import { UpdateSignDto } from './dto/update-signs.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/signs',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};

@ApiBearerAuth()
@Controller('signs')
export class SignsController {
  constructor(private readonly signsService: SignsService) { }

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create(@Body() createSignDto: CreateSignDto, @UploadedFile() file: Express.Multer.File) {
    const dataPayload = {
      ...createSignDto,
      Image: file ? file.path.replace(/\\/g, '/') : undefined,
    };
    return this.signsService.create(createSignDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSignDto: UpdateSignDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const newImagePath = file ? file.path.replace(/\\/g, '/') : undefined;
    const updatedSign = await this.signsService.updateImage(id, updateSignDto, newImagePath);

    return {
      success: true,
      statusCode: 200,
      message: 'Request successful',
      data: updatedSign,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.signsService.remove(id);
  }
}
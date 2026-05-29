import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { AppService } from './app.service';

@ApiBearerAuth()
@ApiTags('Upload')
@Controller('uploads')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Upload successful',
      path: `/images/${file.filename}`,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('images/:filename')
  @ApiParam({
    name: 'filename',
    required: true,
    type: String
  })

  @ApiResponse({ status: 200, description: 'File deleted successfully.' })
  async deleteImage(@Param('filename') filename: string) {
    return await this.appService.deleteImage(filename);
  }
}
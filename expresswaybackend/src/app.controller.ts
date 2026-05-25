import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';

@ApiTags('Upload')
@Controller('upload')
export class AppController {

  @Post()
  @ApiConsumes('multipart/form-data') 
  @ApiBody({                   
    schema: {
      type: 'object',
      properties: {
        file: {                   
          type: 'string',
          format: 'binary',           
          description: 'Chọn file hình ảnh từ máy tính (.jpg, .png)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Upload thành công',
      path: `/images/${file.filename}`,
    };
  }
}
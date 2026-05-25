import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Put, Patch, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post('register')
  async register(@Body() body: any) {
    return {
      success: true,
      statusCode: 201,
      message: 'Đăng ký thành công, vui lòng kiểm tra email để nhận mã kích hoạt!',
      data: body
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.changeUserRole(+id, updateUserDto);
  }

  @Put('profile')

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data') // Khai báo form chứa file
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // Định nghĩa các trường văn bản từ UpdateUserDto cho Swagger hiện ô nhập
        username: { type: 'string', description: 'New username' },
        email: { type: 'string', description: 'New email address' },
        // Định nghĩa trường file để Swagger hiển thị nút chọn ảnh
        avatar: { 
          type: 'string',
          format: 'binary',
          description: 'Upload profile image file' 
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar', { // Key nhận file là 'avatar'
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async updateProfile(
    @Req() req: any, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req.user.id;

    // Nếu người dùng có upload file mới, gắn tên file vào DTO để lưu vào Database
    if (file) {
      updateUserDto.Avatar = file.filename; // Gán chuỗi tên file (hoặc đường dẫn)
    }

    return await this.usersService.updateProfile(+userId, updateUserDto);
  }
}
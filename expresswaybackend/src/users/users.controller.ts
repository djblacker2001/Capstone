import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Put, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() userData: Partial<User>) {
    return this.usersService.create(userData);
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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  getAdminData() {
    return 'Chỉ admin mới thấy';
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars', // Thư mục lưu ảnh
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`); // Đổi tên file để tránh trùng
      },
    }),
  }))
  async uploadAvatar(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    const avatarPath = `uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(id, avatarPath);
  }
}
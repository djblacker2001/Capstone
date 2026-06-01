import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards, Put, Patch, UploadedFile, UseInterceptors, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeAvatar(@Req() req: any) {
    const userId = req.user.userId;
    return await this.usersService.removeAvatar(+userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'New username' },
        email: { type: 'string', description: 'New email address' },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Upload profile image file'
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar', {
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
    const jwtUserId = req.user.userId; 
    if (!jwtUserId) {
      throw new UnauthorizedException('Invalid token payload structure');
    }

    if (file) {
      updateUserDto.Avatar = file.filename;
    }

    return await this.usersService.updateProfile(+jwtUserId, updateUserDto);
  }
}
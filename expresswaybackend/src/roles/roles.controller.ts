import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './roles.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Lấy danh sách tất cả các quyền (Admin, Staff, etc.)
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  // Xem chi tiết một quyền cụ thể
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  // Tạo mới một quyền (ví dụ: 'HighwayManager')
  @Post()
  create(@Body() roleData: Partial<Role>) {
    return this.rolesService.create(roleData);
  }
}
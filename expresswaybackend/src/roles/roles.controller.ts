import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './roles.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(@Body() roleData: Partial<Role>) {
    return this.rolesService.create(roleData);
  }
}
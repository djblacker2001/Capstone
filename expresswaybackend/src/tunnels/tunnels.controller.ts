import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TunnelsService } from './tunnels.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTunnelDto } from './dto/create-tunnels.dto';
import { UpdateTunnelDto } from './dto/update-tunnels.dto';

@ApiBearerAuth()
@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) { }

  @Get()
  findAll() {
    return this.tunnelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tunnelsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createtunnelDto: CreateTunnelDto) {
    return this.tunnelsService.create(createtunnelDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatetunnelDto: UpdateTunnelDto) {
    return this.tunnelsService.update(id, updatetunnelDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tunnelsService.remove(id);
  }
}
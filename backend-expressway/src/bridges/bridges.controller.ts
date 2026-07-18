import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BridgesService } from './bridges.service';
import { Bridge } from './bridges.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateBridgeDto } from './dto/create-bridges.dto';
import { UpdateBridgeDto } from './dto/update-bridges.dto';

@ApiBearerAuth()
@Controller('bridges')
export class BridgesController {
  constructor(private readonly bridgesService: BridgesService) {}

  @Get()
  findAll() {
    return this.bridgesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bridgesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createBridgeDto: CreateBridgeDto) {
    return this.bridgesService.create(createBridgeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBridgeDto: UpdateBridgeDto) {
    return this.bridgesService.update(id, updateBridgeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bridgesService.remove(id);
  }
}
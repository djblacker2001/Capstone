import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TunnelsService } from './tunnels.service';
import { Tunnel } from './tunnels.entity';

@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  @Get()
  findAll() {
    return this.tunnelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tunnelsService.findOne(id);
  }

  @Post()
  create(@Body() tunnelData: Partial<Tunnel>) {
    return this.tunnelsService.create(tunnelData);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() tunnelData: Partial<Tunnel>
  ) {
    return this.tunnelsService.update(id, tunnelData);
  }

  // Xóa hầm khỏi danh sách quản lý
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tunnelsService.remove(id);
  }
}
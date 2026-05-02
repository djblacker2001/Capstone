import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TunnelsService } from './tunnels.service';
import { Tunnel } from './tunnels.entity';

@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  // Lấy danh sách tất cả các hầm trên toàn tuyến
  @Get()
  findAll() {
    return this.tunnelsService.findAll();
  }

  // Lấy thông tin chi tiết một đường hầm cụ thể
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tunnelsService.findOne(id);
  }

  // Tạo mới thông tin hầm
  // Dữ liệu gửi lên cần: SectionId, NameTunnel, Length, Height, HasLighting
  @Post()
  create(@Body() tunnelData: Partial<Tunnel>) {
    return this.tunnelsService.create(tunnelData);
  }

  // Cập nhật thông số hầm (ví dụ: cập nhật lại chiều cao hoặc trạng thái đèn)
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
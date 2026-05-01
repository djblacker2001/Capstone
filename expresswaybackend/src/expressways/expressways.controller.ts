import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ExpresswaysService } from "./expressways.service";

@Controller('expressways')
export class ExpresswaysController {
  constructor(private service: ExpresswaysService) {}

  @Post()
  create(@Body() data) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateSectionDto } from "./dto/create-section.dto";
import { SectionsService } from "./sections.service";

@Controller('sections')
export class SectionsController {
  constructor(private service: SectionsService) {}

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
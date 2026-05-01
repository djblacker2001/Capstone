import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { Section } from "./section.entity";
import { SectionsController } from "./sections.controller";
import { SectionsService } from "./sections.service";

@Module({
  imports: [TypeOrmModule.forFeature([Section])],
  controllers: [SectionsController],
  providers: [SectionsService],
})
export class SectionsModule {}
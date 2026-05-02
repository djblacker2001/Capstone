import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { Section } from './sections.entity';

@Module({
  imports: [
    // Đăng ký Entity Section để sử dụng Repository trong Service
    TypeOrmModule.forFeature([Section]),
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService], // Export nếu module khác cần sử dụng logic của Section
})
export class SectionsModule { }
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expressway } from './expressways.entity';
import { ExpresswaysService } from './expressways.service';
import { ExpresswaysController } from './expressways.controller';
import { Section } from '../sections/sections.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expressway, Section])],
  controllers: [ExpresswaysController],
  providers: [ExpresswaysService],
  exports: [ExpresswaysService],
})
export class ExpresswaysModule {}

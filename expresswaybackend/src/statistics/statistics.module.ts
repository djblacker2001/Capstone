import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Expressway } from '../expressways/expressways.entity';
import { Section } from '../sections/sections.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expressway, Section]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
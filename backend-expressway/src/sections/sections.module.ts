import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { Section } from './sections.entity';
import { RestStop } from '../rest-stops/rest-stops.entity';
import { Bridge } from '../bridges/bridges.entity';
import { Interchange } from '../interchanges/interchanges.entity';
import { Tunnel } from '../tunnels/tunnels.entity';
import { Province } from '../provinces/provinces.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section, RestStop, Bridge, Interchange, Tunnel, Province]),
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule { }
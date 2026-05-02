import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestStop } from './rest-stop.entity';
import { RestStopsService } from './rest-stops.service';
import { RestStopsController } from './rest-stops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RestStop])],
  controllers: [RestStopsController],
  providers: [RestStopsService],
  exports: [RestStopsService],
})
export class RestStopsModule {}
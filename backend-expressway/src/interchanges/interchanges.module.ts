import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interchange } from './interchanges.entity';
import { InterchangesService } from './interchanges.service';
import { InterchangesController } from './interchanges.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interchange]),
  ],
  controllers: [InterchangesController],
  providers: [InterchangesService],
  exports: [InterchangesService],
})
export class InterchangesModule {}
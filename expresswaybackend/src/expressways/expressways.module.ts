import { Module } from '@nestjs/common';
import { ExpresswaysController } from './expressways.controller';
import { ExpresswaysService } from './expressways.service';
import { Expressway } from './expressway.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Expressway])],
  controllers: [ExpresswaysController],
  providers: [ExpresswaysService],
})
export class ExpresswaysModule {}

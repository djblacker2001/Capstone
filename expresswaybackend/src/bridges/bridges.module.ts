import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bridge } from './bridges.entity';
import { BridgesService } from './bridges.service';
import { BridgesController } from './bridges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bridge])],
  controllers: [BridgesController],
  providers: [BridgesService],
  exports: [BridgesService],
})
export class BridgesModule {}
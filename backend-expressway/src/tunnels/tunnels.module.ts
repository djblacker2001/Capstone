import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tunnel } from './tunnels.entity';
import { TunnelsService } from './tunnels.service';
import { TunnelsController } from './tunnels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tunnel])],
  controllers: [TunnelsController],
  providers: [TunnelsService],
  exports: [TunnelsService],
})
export class TunnelsModule {}
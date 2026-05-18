import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expressway } from './expressways.entity';
import { ExpresswaysService } from './expressways.service';
import { ExpresswaysController } from './expressways.controller';
import { Section } from '../sections/sections.entity';
import { Bridge } from '../bridges/bridges.entity';
import { Interchange } from '../interchanges/interchanges.entity';
import { Province } from '../provinces/provinces.entity';
import { RestStop } from '../rest-stops/rest-stops.entity';
import { Tunnel } from '../tunnels/tunnels.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expressway, Section, RestStop, Bridge, Interchange, Tunnel, Province]),
    AuthModule,
  ],
  controllers: [ExpresswaysController],
  providers: [ExpresswaysService],
  exports: [ExpresswaysService],
})
export class ExpresswaysModule { }

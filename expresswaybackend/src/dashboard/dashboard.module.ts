import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { Transaction } from 'typeorm';
import { Expressway } from '../expressways/expressways.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Expressway]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
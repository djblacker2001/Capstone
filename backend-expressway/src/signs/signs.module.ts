import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignsService } from './signs.service';
import { SignsController } from './signs.controller';
import { Sign } from './signs.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sign]),
  ],
  controllers: [SignsController],
  providers: [SignsService],
  exports: [SignsService], 
})
export class SignsModule {}
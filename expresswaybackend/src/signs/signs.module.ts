import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignsService } from './signs.service';
import { SignsController } from './signs.controller';
import { Sign } from './signs.entity';

@Module({
  imports: [
    // Đăng ký entity Sign để TypeORM tạo Repository cho Service sử dụng
    TypeOrmModule.forFeature([Sign]),
  ],
  controllers: [SignsController],
  providers: [SignsService],
  // Export SignsService nếu bạn muốn các Module khác (như Sections) có thể dùng chung
  exports: [SignsService], 
})
export class SignsModule {}
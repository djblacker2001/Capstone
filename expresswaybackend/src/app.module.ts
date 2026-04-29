import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpresswaysModule } from './expressways/expressways.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: '123456',
      database: 'Capstone',
      autoLoadEntities: true,
      synchronize: true,
      options: {
        encrypt: false,
      },
    }),
    ExpresswaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

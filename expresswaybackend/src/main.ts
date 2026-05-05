import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import * as express from 'express';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use('/ways', express.static(join(__dirname, '..', 'uploads/ways')));
  app.use('/signs', express.static(join(__dirname, '..', 'uploads/signs')));
  app.enableCors({
    origin: 'http://localhost:3000', // frontend của bạn
    credentials: true,
  });
  await app.listen(8080);
}
bootstrap();

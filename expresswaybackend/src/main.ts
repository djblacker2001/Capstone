import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/ways', express.static(join(__dirname, '..', 'uploads/ways')));
  app.use('/signs', express.static(join(__dirname, '..', 'uploads/signs')));
  await app.listen(8080);
}
bootstrap();

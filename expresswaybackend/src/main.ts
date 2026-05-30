import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import * as express from 'express';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  const config = new DocumentBuilder()
    .setTitle('North-South Expressway Management Software')
    .setDescription('API Capstone')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'accept-language',
      in: 'header',
      required: false,
      schema: { default: 'en' },
      description: 'Feedback language:"vi" for Vietnamese or "en" for English',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(8080);
}
bootstrap();

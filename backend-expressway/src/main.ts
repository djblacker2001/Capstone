import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';

let cachedServer: ((req: Request, res: Response) => void) | null = null;

async function createNestApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());

  const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.100.28:3000',
    'http://10.30.70.237:3000',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
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

  return app;
}

async function getServerHandler() {
  if (!cachedServer) {
    const app = await createNestApp();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer!;
}

export default async function handler(req: Request, res: Response) {
  const server = await getServerHandler();
  return server(req, res);
}

async function bootstrap() {
  const app = await createNestApp();
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

if (!process.env.VERCEL) {
  bootstrap();
}
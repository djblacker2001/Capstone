import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignsModule } from './signs/signs.module';
import { ExpresswaysModule } from './expressways/expressways.module';
import { BridgesModule } from './bridges/bridges.module';
import { TunnelsModule } from './tunnels/tunnels.module';
import { SectionsModule } from './sections/sections.module';
import { InterchangesModule } from './interchanges/interchanges.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RestStopsModule } from './rest-stops/rest-stops.module';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { ProvincesModule } from './provinces/provinces.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path, { join } from 'path';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'; 
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost', 
      port: Number(process.env.DB_PORT) || 1433,
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'Project',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),

    SignsModule,
    ExpresswaysModule,
    BridgesModule,
    TunnelsModule,
    SectionsModule,
    InterchangesModule,
    UsersModule,
    RolesModule,
    RestStopsModule,
    AuthModule,
    ProvincesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'images'),
      serveRoot: '/images',
    }),
    DashboardModule,

    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n'), 
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new AcceptLanguageResolver(),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
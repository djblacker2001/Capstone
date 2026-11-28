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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST') || 'capstone-expressway-sql-v2.database.windows.net';
        const port = Number(configService.get<string>('DB_PORT')) || 1433;
        const username = configService.get<string>('DB_USERNAME') || 'sqladmin';
        const password = configService.get<string>('DB_PASSWORD') || 'Hoangzelo2001!';
        const database = configService.get<string>('DB_NAME') || 'ExpresswayDb';

        console.log('MSSQL config:', { host, port, username, database, passLen: password?.length });

        return {
          type: 'mssql',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          options: {
            encrypt: true,
            trustServerCertificate: true,
          },
        };
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
        watch: false,
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
  constructor(private dataSource: DataSource) { }
}
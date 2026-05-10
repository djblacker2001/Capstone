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
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: '123456',
      database: 'Project',
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
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

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
import { UsersModule } from './user/users.module';
import { RolesModule } from './roles/roles.module';
import { RestStopsModule } from './rest-stops/rest-stops.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '(localdb)',
      port: 1433,        
      database: 'Capstone',
      username: 'sa',
      password: '123456',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      extra: {
        trustServerCertificate: true,
        options: {
          instanceName: 'MSSQLLocalDB',
          encrypt: false,
        },
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

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { 
  constructor(private dataSource: DataSource) {}
}
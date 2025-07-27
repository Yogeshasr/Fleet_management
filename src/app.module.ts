import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrucksModule } from './trucks/trucks.module';
import { DriversModule } from './drivers/drivers.module';
import { TripsModule } from './trips/trips.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import * as fs from 'fs';
import * as path from 'path';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca.pem')).toString()
      },
    }),
    

    AuthModule,
    TrucksModule,
    DriversModule,
    TripsModule,
    ClientsModule,
    UsersModule,
    ReportsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
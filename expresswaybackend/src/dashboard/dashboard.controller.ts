import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('traffic')
  async getPublicTraffic(@I18nLang() lang: string) {
    return await this.dashboardService.getPublicTrafficData(lang);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('analytics')
  async getAdminAnalytics(@I18nLang() lang: string) {
    return await this.dashboardService.getAdminAnalyticsData(lang);
  }
}
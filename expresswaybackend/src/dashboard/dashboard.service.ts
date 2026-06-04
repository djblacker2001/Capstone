import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly usersService: UsersService,
        private readonly i18n: I18nService,
    ) { }

    async getMonthlyAnalyticsStats(lang: string): Promise<any[]> {
        const statsConfig = [
            { key: 'JANUARY', vehicleCount: 95000, revenue: 2900000000 },
            { key: 'FEBRUARY', vehicleCount: 105000, revenue: 3200000000 },
            { key: 'MARCH', vehicleCount: 128000, revenue: 3900000000 },
            { key: 'APRIL', vehicleCount: 165000, revenue: 5000000000 },
            { key: 'MAY', vehicleCount: 195000, revenue: 5900000000 },
            { key: 'JUNE', vehicleCount: 225000, revenue: 6800000000 },
            { key: 'JULY', vehicleCount: 245000, revenue: 7400000000 },
            { key: 'AUGUST', vehicleCount: 240000, revenue: 7300000000 },
            { key: 'SEPTEMBER', vehicleCount: 218000, revenue: 6600000000 },
            { key: 'OCTOBER', vehicleCount: 182000, revenue: 5500000000 },
            { key: 'NOVEMBER', vehicleCount: 152000, revenue: 4500000000 },
            { key: 'DECEMBER', vehicleCount: 115000, revenue: 3500000000 }
        ];

        return Promise.all(
            statsConfig.map(async (item) => {
                return {
                    month: await this.i18n.t(`dashboard.${item.key}`, { lang }),
                    vehicleCount: item.vehicleCount,
                    revenue: item.revenue,
                    rawMonthKey: item.key
                };
            })
        );
    }

    async getPublicTrafficData(lang: string) {
        const monthlyData = await this.getMonthlyAnalyticsStats(lang);
        return monthlyData.map(({ month, vehicleCount }) => ({ month, vehicleCount }));
    }

    async getAdminAnalyticsData(lang: string) {
        const userGrowth = await this.usersService.countUsersByMonth();
        const totalUsers = await this.usersService.countAllActiveUsers();
        const financialAndTrafficStats = await this.getMonthlyAnalyticsStats(lang);
        const totalAnnualRevenue = financialAndTrafficStats.reduce((sum, item) => sum + item.revenue, 0);

        return {
            widgets: {
                totalUsers: totalUsers || 0,
                totalAnnualRevenue: totalAnnualRevenue
            },
            analyticsChart: financialAndTrafficStats.map(({ rawMonthKey, ...rest }) => rest),
            userGrowthChart: userGrowth,
        };
    }
}
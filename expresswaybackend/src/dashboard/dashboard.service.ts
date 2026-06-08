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
            { key: 'JANUARY', vehicleCount: 19891000, revenue: 1144900000000 },
            { key: 'FEBRUARY', vehicleCount: 19891000, revenue: 1144900000000 },
            { key: 'MARCH', vehicleCount: 20569472, revenue: 1313400000000 },
            { key: 'APRIL', vehicleCount: 21122545, revenue: 1372400000000 },
            { key: 'MAY', vehicleCount: 22250000, revenue: 1578500000000 },
            { key: 'JUNE', vehicleCount: 21962949, revenue: 1558100000000 },
            { key: 'JULY', vehicleCount: 21962949, revenue: 1558100000000 },
            { key: 'AUGUST', vehicleCount: 18720000, revenue: 1289500000000 },
            { key: 'SEPTEMBER', vehicleCount: 18720000, revenue: 1289500000000 },
            { key: 'OCTOBER', vehicleCount: 19557018, revenue: 1484800000000 },
            { key: 'NOVEMBER', vehicleCount: 19834072, revenue: 1291800000000 },
            { key: 'DECEMBER', vehicleCount: 22066669, revenue: 1439600000000 }
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
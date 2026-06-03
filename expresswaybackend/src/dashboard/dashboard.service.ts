import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly usersService: UsersService,
        private readonly i18n: I18nService,
    ) { }

    async getPublicTrafficData() {
        return [
            { hour: '00:00', vehicleCount: 120 },
            { hour: '04:00', vehicleCount: 80 },
            { hour: '08:00', vehicleCount: 1450 },
            { hour: '12:00', vehicleCount: 600 },
            { hour: '16:00', vehicleCount: 1800 },
            { hour: '20:00', vehicleCount: 750 },
        ];
    }

    async getRevenueDataByDay(lang: string): Promise<any[]> {
        const daysConfig = [
            { key: 'MONDAY', revenue: 52000000 },
            { key: 'TUESDAY', revenue: 68000000 },
            { key: 'WEDNESDAY', revenue: 45000000 },
            { key: 'THURSDAY', revenue: 71000000 },
            { key: 'FRIDAY', revenue: 89000000 },
            { key: 'SATURDAY', revenue: 95000000 },
            { key: 'SUNDAY', revenue: 82000000 }
        ];

        return Promise.all(
            daysConfig.map(async (item) => {
                return {
                    day: await this.i18n.t(`dashboard.${item.key}`, { lang }),
                    revenue: item.revenue,
                    rawDayKey: item.key
                };
            })
        );
    }

    async getAdminAnalyticsData(lang: string) {
        const userGrowth = await this.usersService.countUsersByMonth();
        const financialRevenue = await this.getRevenueDataByDay(lang);
        const totalUsers = await this.usersService.countAllActiveUsers();
        const daysMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const todayIndex = new Date().getDay(); 
        const todayKey = daysMap[todayIndex];
        const todayData = financialRevenue.find(item => item.rawDayKey === todayKey);
        const todayRevenueAmount = todayData ? todayData.revenue : 0;
        const totalWeeklyRevenue = financialRevenue.reduce((sum, item) => sum + item.revenue, 0); 

        return {
            widgets: {
                totalUsers: totalUsers || 0,
                activeIncidents: 3,
                todayRevenueAmount: todayRevenueAmount,
                totalWeeklyRevenue: totalWeeklyRevenue
            },
            revenueChart: financialRevenue.map(({ rawDayKey, ...rest }) => rest),
            userGrowthChart: userGrowth,
        };
    }
}
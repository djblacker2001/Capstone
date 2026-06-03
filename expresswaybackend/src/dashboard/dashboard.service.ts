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

    async getRevenueDataByMonth(lang: string): Promise<any[]> {
        const monthsConfig = [
            { key: 'JANUARY', revenue: 1250000000 },   // 1.25 tỷ
            { key: 'FEBRUARY', revenue: 1420000000 },  // 1.42 tỷ
            { key: 'MARCH', revenue: 1180000000 },     // 1.18 tỷ
            { key: 'APRIL', revenue: 1350000000 },     // 1.35 tỷ
            { key: 'MAY', revenue: 1600000000 },       // 1.60 tỷ (Mùa du lịch tăng cao)
            { key: 'JUNE', revenue: 1750000000 },      // 1.75 tỷ
            { key: 'JULY', revenue: 1680000000 },      // 1.68 tỷ
            { key: 'AUGUST', revenue: 1520000000 },    // 1.52 tỷ
            { key: 'SEPTEMBER', revenue: 1300000000 }, // 1.30 tỷ
            { key: 'OCTOBER', revenue: 1220000000 },   // 1.22 tỷ
            { key: 'NOVEMBER', revenue: 1150000000 },  // 1.15 tỷ
            { key: 'DECEMBER', revenue: 1850000000 }   // 1.85 tỷ (Cuối năm vận tải tăng vọt)
        ];

        return Promise.all(
            monthsConfig.map(async (item) => {
                return {
                    // Dịch tên tháng theo i18n
                    month: await this.i18n.t(`dashboard.${item.key}`, { lang }),
                    revenue: item.revenue,
                    rawMonthKey: item.key // Giữ lại key để tính toán
                };
            })
        );
    }

    async getAdminAnalyticsData(lang: string) {
        const userGrowth = await this.usersService.countUsersByMonth();
        const financialRevenue = await this.getRevenueDataByMonth(lang);
        const totalUsers = await this.usersService.countAllActiveUsers();
        const monthsMap = [
            'JANUARY', 
            'FEBRUARY', 
            'MARCH', 
            'APRIL', 
            'MAY', 
            'JUNE', 
            'JULY', 
            'AUGUST', 
            'SEPTEMBER', 
            'OCTOBER', 
            'NOVEMBER', 
            'DECEMBER'
        ];

        const currentMonthIndex = new Date().getMonth(); 
        const currentMonthKey = monthsMap[currentMonthIndex];
        const currentMonthData = financialRevenue.find(item => item.rawMonthKey === currentMonthKey);
        const currentMonthRevenue = currentMonthData ? currentMonthData.revenue : 0;
        const todayRevenueAmount = Math.floor(currentMonthRevenue / 30);
        const totalAnnualRevenue = financialRevenue.reduce((sum, item) => sum + item.revenue, 0);

        return {
            widgets: {
                totalUsers: totalUsers || 0,
                activeIncidents: 3,
                todayRevenueAmount: todayRevenueAmount,
                totalAnnualRevenue: totalAnnualRevenue
            },
            revenueChart: financialRevenue.map(({ rawMonthKey, ...rest }) => rest),
            userGrowthChart: userGrowth,
        };
    }
}
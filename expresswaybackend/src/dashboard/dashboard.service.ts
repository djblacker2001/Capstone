import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Dashboard)
        private readonly dashboardRepository: Repository<Dashboard>,
        private readonly i18n: I18nService,
        private readonly usersService: UsersService,
    ) { }

    async getMonthlyAnalyticsStats(lang: string): Promise<any[]> {
        // 1. Lấy dữ liệu từ DB (Lúc này đã tự động có thêm trường Violate nhờ Entity bước 1)
        const dbStats = await this.dashboardRepository.find();

        const monthOrder = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];

        // 2. Cập nhật logic toán tử reduce để cộng gộp số ca vi phạm theo từng tháng
        const groupedStats = dbStats.reduce((acc, item) => {
            const monthKey = item.Month.toUpperCase();

            if (!acc[monthKey]) {
                // Vị trí 1: Khởi tạo giá trị mặc định ban đầu là 0
                acc[monthKey] = { vehicleCount: 0, revenue: 0, violate: 0 };
            }

            acc[monthKey].vehicleCount += item.VehicleCount;
            acc[monthKey].revenue += item.Revenue;
            acc[monthKey].violate += item.Violate; // Vị trí 2: Cộng dồn số ca vi phạm của các expressway

            return acc;
        }, {} as Record<string, { vehicleCount: number; revenue: number; violate: number }>);

        // 3. Cấu trúc lại mảng trả về đồng bộ sang Front-end
        return Promise.all(
            monthOrder.map(async (key) => {
                const stat = groupedStats[key] || { vehicleCount: 0, revenue: 0, violate: 0 };

                return {
                    month: await this.i18n.t(`dashboard.${key}`, { lang }),
                    vehicleCount: stat.vehicleCount,
                    revenue: stat.revenue,
                    violationCount: stat.violate, // Vị trí 3: Gán trường violate vào key violationCount mà Front-end đang đợi gọi
                    rawMonthKey: key
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
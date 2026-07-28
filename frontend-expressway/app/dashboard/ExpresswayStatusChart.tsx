'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Spin, message } from 'antd';
import { Pie } from '@ant-design/plots';
import "./style.css";

interface ChartDataItem {
    type: string;
    value: number;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

export default function ExpresswayStatusChart() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [total, setTotal] = useState<number>(0);
    const [isMobileSize, setIsMobileSize] = useState<boolean>(false);

    // Xử lý kiểm tra màn hình Responsive an toàn trên SSR Next.js
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileSize(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch(`${baseUrl}/expressways/statistics`)
            .then((res) => {
                if (!res.ok) throw new Error('Không thể lấy dữ liệu thống kê');
                return res.json();
            })
            .then((resData) => {
                if (resData.success && resData.data) {
                    const stats = resData.data;

                    // Mapping đúng 5 trạng thái theo JSON API Response thực tế
                    const formattedData: ChartDataItem[] = [
                        { type: 'Not Yet Under Construction', value: stats.totalSectionsNotYetUnderConstruction || 0 },
                        { type: 'Under Construction', value: stats.totalSectionsUnderConstruction || 0 },
                        { type: 'Completed / Operating', value: stats.totalSectionsCompleted || 0 },
                        { type: 'Extending / Under Construction', value: stats.totalSectionsExtendConstruction || 0 },
                        { type: 'Maintenance', value: stats.totalSectionsMaintenance || 0 },
                    ];

                    // Lọc ra các trạng thái có số lượng > 0 (Dựa trên JSON của bạn sẽ giữ lại Completed và Extend Construction)
                    const filteredData = formattedData.filter(item => item.value > 0);
                    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);

                    setTotal(sum);
                    setChartData(filteredData);
                }
                setLoading(false);
            })
            .catch((err) => {
                message.error(err.message || 'Lỗi tải dữ liệu biểu đồ');
                setLoading(false);
            });
    }, []);

    // Cấu hình Biểu đồ Pie
    const config = useMemo(() => {
        return {
            data: chartData,
            angleField: 'value',
            colorField: 'type',
            // Dãy 5 màu chuẩn UI tương ứng với 5 trạng thái
            color: ['#8c8c8c', '#faad14', '#52c41a', '#1890ff', '#ff4d4f'],
            radius: isMobileSize ? 0.8 : 0.7,
            label: isMobileSize
                ? false
                : {
                    text: (d: ChartDataItem) => {
                        const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';
                        return `${d.type}: ${d.value} (${percent}%)`;
                    },
                    position: 'outside',
                    style: {
                        fontWeight: 'bold',
                        fontSize: 11,
                    },
                },
            legend: {
                position: isMobileSize ? ('bottom' as const) : ('right' as const),
                autoWrap: true,
                offsetX: isMobileSize ? 0 : -10,
                offsetY: isMobileSize ? 10 : 0,
                itemName: {
                    formatter: (text: string) => {
                        const dataItem = chartData.find(d => d.type === text);
                        if (dataItem && total > 0) {
                            const percent = ((dataItem.value / total) * 100).toFixed(1);
                            return `${text}: ${dataItem.value} (${percent}%)`;
                        }
                        return text;
                    },
                    style: {
                        fontSize: 12,
                    },
                },
            },
            tooltip: {
                items: [{ field: 'value', name: 'Số đoạn' }],
            },
        };
    }, [chartData, total, isMobileSize]);

    return (
        <Card
            title="Highway Segment Status Statistics"
            style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '12px',
                height: '100%',
            }}
        >
            {loading ? (
                <div className="chart-loading-wrapper">
                    <Spin tip="Đang tính toán biểu đồ..." />
                </div>
            ) : (
                <div className="pie-chart-container">
                    <Pie {...config} />
                </div>
            )}
        </Card>
    );
}
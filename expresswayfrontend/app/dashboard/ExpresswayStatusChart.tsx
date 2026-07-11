'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, message } from 'antd';
import { Pie } from '@ant-design/plots';
import "./style.css";

interface ChartDataItem {
    type: string;
    value: number;
}

export default function ExpresswayStatusChart() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [total, setTotal] = useState<number>(0);
    const isMobileSize = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetch(`${backendUrl}/expressways/statistics`)
            .then((res) => {
                if (!res.ok) throw new Error('Không thể lấy dữ liệu thống kê');
                return res.json();
            })
            .then((resData) => {
                if (resData.success && resData.data) {
                    const stats = resData.data;

                    const formattedData: ChartDataItem[] = [
                        { type: 'Active / Complete', value: stats.totalCompleted || 0 },
                        { type: 'Under Construction', value: stats.totalUnderConstruction || 0 },
                        { type: 'Extending / Under Construction', value: stats.totalExtendConstruction || 0 },
                    ];

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
    }, [backendUrl]);

    const config = {
        data: chartData,
        angleField: 'value',
        colorField: 'type',
        label: isMobileSize
            ? false
            : {     
                text: (d: ChartDataItem) => {
                    const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                    return `${d.type}: ${d.value} (${percent}%)`;
                },
                position: 'outside',
                style: {
                    fontWeight: 'bold',
                    fontSize: 11,
                },
            },

        radius: isMobileSize ? 0.8 : 0.7,
        color: ['#1890ff', '#faad14', '#52c41a'],
        legend: {
            position: isMobileSize ? 'bottom' : 'right',
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
                }
            },
        },
        tooltip: {
            items: [{ field: 'value', name: 'Số đoạn' }],
        },
    };

    return (
        <Card title="Thống Kê Trạng Thái Phân Đoạn Cao Tốc"
            style={{
                width: '100%',
                height: '97%',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '12px'
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
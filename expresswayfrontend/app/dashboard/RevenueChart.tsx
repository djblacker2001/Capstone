'use client';

import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';

interface ChartDataItem {
    month: string;
    vehicleCount: number;
    revenue: number;
}

export default function RevenueChart() {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        if (!savedUser || !token || token === "undefined") {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);
            const userRoleId = parsedUser?.RoleId || parsedUser?.roleId;
            if (Number(userRoleId) === 1) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error("Lỗi parse thông tin user:", error);
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        fetch(`${baseUrl}/dashboard/revenue`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept-language': 'en'
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP Error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then((resBody) => {
                if (resBody.success && resBody.data && resBody.data.analyticsChart) {
                    setData(resBody.data.analyticsChart);
                } else {
                    console.warn('API respond structure mismatch:', resBody);
                }
            })
            .catch((err) => {
                console.error('Fetch operation failed:', err);
                message.error('Không thể kết nối đến máy chủ để lấy dữ liệu biểu đồ');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    if (loading) {
        return (
            <Card bordered={false} style={{ width: '100%', borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
                <Spin tip="Loading analytics chart data..." />
            </Card>
        );
    }

    if (!isAdmin) {
        return null;
    }

    const config = {
        data,
        xField: 'month',
        yField: 'revenue',
        label: {
            text: (d: ChartDataItem) => {
                const billionValue = d.revenue / 1000000000;
                return billionValue.toFixed(1);
            },
            position: 'element-top',
            style: {
                fill: '#000000',
                opacity: 0.6,
                fontSize: 12,
                fontWeight: 'bold',
            },
        },
        style: {
            fill: '#3B71CA',
            radiusTopLeft: 4,
            radiusTopRight: 4,
            maxWidth: 45,
        },
        axis: {
            y: {
                title: 'Billion VND',
                labelFormatter: (v: number) => `${v / 1000000000}`,
            },
            x: {
                title: null,
            }
        },
        tooltip: {
            items: [
                {
                    channel: 'y',
                    name: 'Revenue',
                    valueFormatter: (v: number) => `${(v / 1000000000).toFixed(2)} Billion VND`
                },
                {
                    name: 'Traffic Volume',
                    field: 'vehicleCount',
                    valueFormatter: (v: number) => `${v.toLocaleString()} vehicles`
                }
            ],
        },
    };

    return (
        <Card
            bordered={false}
            style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '12px'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontWeight: 'bold',
                    fontSize: '28px',
                    color: '#000',
                    margin: 0
                }}>
                    Expressway Toll Collection Revenue Metrics
                </h2>
            </div>

            <div style={{ height: '450px' }}>
                {data.length > 0 ? <Column {...config} /> : <div style={{ textAlign: 'center', paddingTop: '200px', color: '#999' }}>Không có dữ liệu hiển thị</div>}
            </div>
        </Card>
    );
};
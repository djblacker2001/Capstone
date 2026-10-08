'use client';

import React, { useEffect, useState } from 'react';
import { Area } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RevenueChart() {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const { t, i18n } = useTranslation();

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

        
        fetch(`${baseUrl}/dashboard/dashboard-admin`, {
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
                <Spin description="Loading analytics chart data..." />
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
        shapeField: 'smooth',
        label: {
            text: (d: ChartDataItem) => {
                const billionValue = d.revenue / 1000000000;
                return billionValue.toFixed(1);
            },
            position: 'top',
            style: {
                fill: '#000000',
                opacity: 0.7,
                fontSize: 11,
                fontWeight: 'bold',
                dy: -8,
            },
        },
        point: {
            shapeField: 'dot',
            sizeField: 4,
            style: {
                stroke: '#003366',
                lineWidth: 2,
                fill: '#fff',
            }
        },
        style: {
            fill: 'linear-gradient(to bottom, #003366 0%, rgba(0, 51, 102, 0.1) 100%)',
            stroke: '#003366',
            lineWidth: 3,
        },
        axis: {
            y: {
                title: t("dashboard.billion"),
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
                    name: t("dashboard.revenue"),
                    valueFormatter: (v: number) => `${(v / 1000000000).toFixed(2)} ${t("dashboard.billion")}`
                },
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
                padding: '12px',
                height: "100%"
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
                    {t("dashboard.expresswayRevenue")}
                </h2>
            </div>

            <div style={{ height: '450px' }}>
                {data.length > 0 ? <Area {...config} /> : <div style={{ textAlign: 'center', paddingTop: '200px', color: '#999' }}>Không có dữ liệu hiển thị</div>}
            </div>
        </Card>
    );
};
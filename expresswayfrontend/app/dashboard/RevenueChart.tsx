'use client';

import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';

interface ChartDataItem {
    month: string;
    vehicleCount: number;
    revenue: number;
}

const RevenueChart = () => {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            console.error('No authorization token found in localStorage.');
            setLoading(false);
            return;
        }

        fetch('http://localhost:8080/dashboard/revenue', {
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
                    message.warning('Data format error from server.');
                }
            })
            .catch((err) => {
                console.error('Fetch operation failed:', err);
                message.error(err.message || 'Failed to connect to API server');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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

            <Spin spinning={loading} tip="Loading analytics chart data...">
                <div style={{ height: '450px' }}>
                    {data.length > 0 ? <Column {...config} /> : null}
                </div>
            </Spin>
        </Card>
    );
};

export default RevenueChart;
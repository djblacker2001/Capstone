'use client';

import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';

interface ChartDataItem {
    month: string; 
    vehicleCount: number;
}
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export default function VehicleTrafficChart() {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        if (!token || token === "undefined") {
            console.error('No authorization token found in localStorage.');
            setLoading(false);
            return;
        }

        
        fetch(`${baseUrl}/dashboard/traffic`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept-language': 'en'
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
                return res.json();
            })
            .then((resBody) => {
                console.log("API Response:", resBody);
                if (resBody.success && Array.isArray(resBody.data)) {
                    setData(resBody.data);
                } else {
                    console.warn('API response structure mismatch. Expected an array in resBody.data:', resBody);
                }
            })
            .catch((err) => {
                console.error('Fetch operation failed:', err);
                message.error('Không thể kết nối đến máy chủ để lấy dữ liệu lưu lượng xe');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const config = {
        data,
        xField: 'month', 
        yField: 'vehicleCount', 
        label: {
            text: (d: ChartDataItem) => {
                if (d.vehicleCount >= 1000000) {
                    return `${(d.vehicleCount / 1000000).toFixed(1)}M`;
                }
                return `${(d.vehicleCount / 1000).toFixed(0)}k`;
            },
            position: 'top',
            style: {
                fill: '#000000',
                opacity: 0.6,
                fontSize: 0,
                fontWeight: 'bold',
            },
        },

        style: {
            fill: '#E67E22',
            radiusTopLeft: 4,
            radiusTopRight: 4,
            maxWidth: 45,
        },

        axis: {
            y: {
                title: 'Vehicles',
                labelFormatter: (v: number) => `${v.toLocaleString()}`, 
            },
            x: {
                title: null,
            }
        },

        tooltip: {
            items: [
                {
                    channel: 'y',
                    name: 'Traffic Volume',
                    valueFormatter: (v: number) => `${v.toLocaleString()} vehicles`
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
                    Expressway Annual Traffic Volume Metrics in 2025
                </h2>
            </div>

            <Spin spinning={loading} tip="Loading traffic analytics data...">
                <div style={{ height: '450px' }}>
                    {data.length > 0 ? (
                        <Column {...config} />
                    ) : (
                        !loading && (
                            <div style={{ textAlign: 'center', paddingTop: '200px', color: '#999' }}>
                                Không có dữ liệu lưu lượng xe hiển thị
                            </div>
                        )
                    )}
                </div>
            </Spin>
        </Card>
    );
};
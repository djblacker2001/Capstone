'use client';

import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';

interface ChartDataItem {
    month: string; 
    vehicleCount: number;
    revenue: number;
}

const VehicleTrafficChart = () => {
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

    // Cấu hình hiển thị biểu đồ lưu lượng xe
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
            position: 'element-top',
            style: {
                fill: '#000000',
                opacity: 0.6,
                fontSize: 12,
                fontWeight: 'bold',
            },
        },

        style: {
            fill: '#E67E22', // Màu cam hổ phách phân biệt với biểu đồ doanh thu
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
                    Expressway Annual Traffic Volume Metrics
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

export default VehicleTrafficChart;
'use client';

import React, { useEffect, useState } from 'react';
// 🎯 Sử dụng Column chart cho dữ liệu thống kê số lượng tuyệt đối
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';

interface ChartDataItem {
    month: string;
    violationCount: number;
}

export default function ViolationChart() {
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
            
            // Bảo mật: Chỉ cho phép Admin (RoleId === 1) tải dữ liệu vi phạm
            if (Number(userRoleId) === 1) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error("Lỗi xác thực quyền Admin:", error);
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
                if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
                return res.json();
            })
            .then((resBody) => {
                if (resBody.success && resBody.data && resBody.data.analyticsChart) {
                    setData(resBody.data.analyticsChart);
                }
            })
            .catch((err) => {
                console.error(err);
                message.error('Không thể kết nối hệ thống để lấy dữ liệu vi phạm');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Card bordered={false} style={{ width: '100%', borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
                <Spin tip="Loading violation analysis..." />
            </Card>
        );
    }

    // Nếu không phải admin, ẩn hoàn toàn component này đi
    if (!isAdmin) return null;

    // ⚙️ Cấu hình cấu trúc biểu đồ cột Ant Design Plots
    const config = {
        data,
        xField: 'month',
        yField: 'violationCount',
        // Hiển thị số ca trực tiếp trên đỉnh mỗi cột để Admin không cần rê chuột vẫn đọc được số liệu
        label: {
            text: (d: ChartDataItem) => `${d.violationCount}`,
            position: 'element-top',
            style: {
                fill: '#000000',
                opacity: 0.7,
                fontSize: 11,
                fontWeight: 'bold',
            },
        },
        // Định dạng hình khối cột
        style: {
            fill: '#E65100', // Màu cam đậm (Cảnh báo vi phạm giao thông)
            radiusTopLeft: 4,  // Bo tròn nhẹ góc trên bên trái của cột
            radiusTopRight: 4, // Bo tròn nhẹ góc trên bên phải của cột
            maxWidth: 40,      // Giới hạn độ rộng tối đa để cột không bị bè ngang
        },
        axis: {
            y: {
                title: 'Cases',
            },
            x: {
                title: null,
            }
        },
        tooltip: {
            items: [
                {
                    channel: 'y',
                    name: 'Total Violations',
                    valueFormatter: (v: number) => `${v.toLocaleString()} cases`
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
                padding: '12px',
                height: '100%'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontWeight: 'bold',
                    fontSize: '26px',
                    color: '#E65100', // Tiêu đề đồng bộ màu cam cảnh báo
                    margin: 0
                }}>
                    Monthly Traffic Violation Analytics
                </h2>
            </div>

            <div style={{ height: '450px' }}>
                {data.length > 0 ? (
                    <Column {...config} />
                ) : (
                    <div style={{ textAlign: 'center', paddingTop: '200px', color: '#999' }}>
                        Không có dữ liệu vi phạm nào được ghi nhận
                    </div>
                )}
            </div>
        </Card>
    );
}
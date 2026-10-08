'use client';

import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { Card, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ViolationChart() {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const { t } = useTranslation();
    const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
    const lastYear = currentYear - 1;

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
            console.error("Lỗi xác thực quyền Admin:", error);
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
                <Spin description="Loading violation analysis..." />
            </Card>
        );
    }
    if (!isAdmin) return null;

    const config = {
        data,
        xField: 'month',
        yField: 'violationCount',
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
        style: {
            fill: '#E65100',
            radiusTopLeft: 4,
            radiusTopRight: 4,
            maxWidth: 40,
        },
        axis: {
            y: {
                title: t("dashboard.cases"),
            },
            x: {
                title: null,
            }
        },
        tooltip: {
            items: [
                {
                    channel: 'y',
                    name: t("dashboard.violation"),
                    valueFormatter: (v: number) => `${v.toLocaleString()} ${t("dashboard.cases")}`
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
                    margin: 0
                }}>
                    {t("dashboard.expresswayViolation")}
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
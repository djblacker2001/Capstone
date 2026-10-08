'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Spin, message } from 'antd';
import { Pie } from '@ant-design/plots';
import "./style.css";
import { useTranslation } from 'react-i18next';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const STATUS_COLORS: Record<string, string> = {
    notYetConstruction: '#faad14',
    underConstruction: '#1890ff',
    complete: '#237804',
    extendUnderConstruction: '#ff7a45',
    maintenance: '#722ed1',
    incident: '#ff4d4f',
};

export default function ExpresswayStatusChart() {
    const [rawStats, setRawStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isMobileSize, setIsMobileSize] = useState<boolean>(false);
    const { t, i18n } = useTranslation();

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
                    setRawStats(resData.data);
                }
                setLoading(false);
            })
            .catch((err) => {
                message.error(err.message || 'Lỗi tải dữ liệu biểu đồ');
                setLoading(false);
            });
    }, []);

    const { chartData, colorMap, total } = useMemo(() => {
        if (!rawStats) return { chartData: [], colorMap: [], total: 0 };
        const items = [
            { key: 'notYetConstruction', label: t("expressway.notYetConstruction"), value: rawStats.totalSectionsNotYetUnderConstruction || 0 },
            { key: 'underConstruction', label: t("expressway.underConstruction"), value: rawStats.totalSectionsUnderConstruction || 0 },
            { key: 'complete', label: t("expressway.complete"), value: rawStats.totalSectionsCompleted || 0 },
            { key: 'extendUnderConstruction', label: t("expressway.extendUnderConstruction"), value: rawStats.totalSectionsExtendConstruction || 0 },
            { key: 'maintenance', label: t("expressway.maintenance"), value: rawStats.totalSectionsMaintenance || 0 },
            { key: 'incident', label: t("expressway.incident"), value: rawStats.totalSectionsIncident || 0 },
        ];

        const filtered = items.filter(item => item.value > 0);
        const sum = filtered.reduce((acc, curr) => acc + curr.value, 0);

        const data = filtered.map(item => ({
            type: item.label,
            value: item.value,
        }));

        const colors = filtered.map(item => STATUS_COLORS[item.key] || '#1890ff');

        return { chartData: data, colorMap: colors, total: sum };
    }, [rawStats, t, i18n.language]);

    const config = useMemo(() => {
        return {
            data: chartData,
            angleField: 'value',
            colorField: 'type',
            scale: {
                color: {
                    range: colorMap,
                },
            },
            radius: isMobileSize ? 0.8 : 0.7,
            label: isMobileSize
                ? false
                : {
                    text: (d: any) => {
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
                items: [{ field: 'value', name: t("dashboard.sectionNumber") }],
            },
        };
    }, [chartData, colorMap, total, isMobileSize]);

    return (
        <Card
            style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '12px',
                height: '100%',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 
                    suppressHydrationWarning
                    style={{
                        fontFamily: '"Times New Roman", Times, serif',
                        fontWeight: 'bold',
                        fontSize: '28px',
                        color: '#000',
                        margin: 0
                    }}
                >
                    {t("dashboard.expresswayStatus")}
                </h2>
            </div>
            {loading ? (
                <div className="chart-loading-wrapper">
                    <Spin description="Loading..." />
                </div>
            ) : (
                <div className="pie-chart-container">
                    <Pie {...config} />
                </div>
            )}
        </Card>
    );
}
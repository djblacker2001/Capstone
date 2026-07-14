'use client';

import { Card, Col, message, Row } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import RevenueChart from "./RevenueChart";
import VehicleTrafficChart from "./VehicleTrafficChart";
import ExpresswayStatusChart from "./ExpresswayStatusChart";
import ViolationChart from "./ViolationChart";
import { useEffect, useState } from "react";
import { data } from "react-router-dom";

const DashboardPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/sections/statistics');
            if (!res.ok) throw new Error('Không thể lấy dữ liệu thống kê');
            const result = await res.json();
            const arrayData = result.data || result;

            if (Array.isArray(arrayData)) {
                setData(arrayData);
            } else {
                console.error("Dữ liệu trả về không phải là mảng:", result);
                setData([]);
            }

        } catch (error) {
            console.error(error);
            message.error('Lỗi kết nối đến API thống kê phân đoạn');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const isArray = Array.isArray(data);
    const totalSections = isArray ? data.length : 0;

    const totalLength = isArray
        ? data.reduce((sum, item) => sum + (Number(item.totalSectionLength) || 0), 0).toFixed(1)
        : "0.0";

    const totalBridges = isArray
        ? data.reduce((sum, item) => sum + (Number(item.bridgeCount) || 0), 0)
        : 0;

    const totalTunnels = isArray
        ? data.reduce((sum, item) => sum + (Number(item.tunnelCount) || 0), 0)
        : 0;
    useEffect(() => {
        fetchStatistics();
    }, []);
    return (
        <ProtectedRoute>
            <MainLayout>
                <Row gutter={[10, 10]} style={{ padding: "30px" }}>
                    <Col xs={24} md={6}>
                        <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng số phân đoạn</p>
                            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold' }}>{totalSections} Tuyến</h2>
                        </Card>
                    </Col>
                    <Col xs={24} md={6}>
                        <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng chiều dài quản lý</p>
                            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#52c41a' }}>{totalLength} km</h2>
                        </Card>
                    </Col>
                    <Col xs={24} md={6}>
                        <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng số Công trình (Cầu / Hầm)</p>
                            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#1890ff' }}>{totalBridges} / {totalTunnels}</h2>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <ExpresswayStatusChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <VehicleTrafficChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <RevenueChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <ViolationChart />
                    </Col>
                </Row>

            </MainLayout>
        </ProtectedRoute>
    )
}

export default DashboardPage;
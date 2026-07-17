'use client';

import { Card, Col, message, Row } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import RevenueChart from "./RevenueChart";
import VehicleTrafficChart from "./VehicleTrafficChart";
import ExpresswayStatusChart from "./ExpresswayStatusChart";
import ViolationChart from "./ViolationChart";
import { useEffect, useState } from "react";
import { AppstoreOutlined, DashboardOutlined, BlockOutlined, NodeIndexOutlined, EnvironmentOutlined, WarningOutlined } from '@ant-design/icons';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//${baseUrl}
export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/expressways/statistics`);
            if (!res.ok) throw new Error('Không thể lấy dữ liệu thống kê');

            const result = await res.json();
            const statsData = result.data || result;

            if (statsData) {
                setData(statsData);
            } else {
                console.error("Dữ liệu trả về trống hoặc sai cấu trúc:", result);
                setData(null);
            }

        } catch (error) {
            console.error(error);
            message.error('Lỗi kết nối đến API thống kê cao tốc');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const totalSections = data ? Number(data.totalSections) || 0 : 0;
    const totalLength = data ? (Number(data.totalSystemLength) || 0).toFixed(1) : "0.0";
    const totalBridges = data ? Number(data.totalBridges) || 0 : 0;
    const totalTunnels = data ? Number(data.totalTunnels) || 0 : 0;
    const totalInterchange = data ? Number(data.totalUniqueInterchanges) || 0 : 0;
    const totalRestStops = data ? Number(data.totalRestStops) || 0 : 0;
    const totalSigns = data ? Number(data.totalSigns) || 0 : 0;
    return (
        <ProtectedRoute>
            <MainLayout>
                <Row gutter={[10, 10]} style={{ padding: "30px" }}>
                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #bae7ff'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#0050b3', margin: 0, fontSize: '13px', fontWeight: 600 }}>Phân đoạn</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#002c8c' }}>
                                        {totalSections} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#434343' }}>đoạn</span>
                                    </h2>
                                </div>
                                <div style={{ background: '#1890ff', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(24, 144, 255, 0.3)' }}>
                                    <AppstoreOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #f9f0ff 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(114, 46, 209, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #d3adf7'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#531dab', margin: 0, fontSize: '13px', fontWeight: 600 }}>Chiều dài quản lý</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#22075e' }}>
                                        {totalLength} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#434343' }}>km</span>
                                    </h2>
                                </div>
                                <div style={{ background: '#722ed1', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(114, 46, 209, 0.3)' }}>
                                    <DashboardOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(255, 169, 64, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #ffe8ba'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#d46b08', margin: 0, fontSize: '13px', fontWeight: 600 }}>Công trình (Cầu/Hầm)</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#612500' }}>
                                        {totalBridges} <span style={{ fontSize: '16px', color: '#8c8c8c', fontWeight: '300' }}>/</span> {totalTunnels}
                                    </h2>
                                </div>
                                <div style={{ background: '#ffa940', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(255, 169, 64, 0.3)' }}>
                                    <BlockOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #d9f7be'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#389e0d', margin: 0, fontSize: '13px', fontWeight: 600 }}>Nút giao</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#135200' }}>
                                        {totalInterchange} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#434343' }}>nút</span>
                                    </h2>
                                </div>
                                <div style={{ background: '#52c41a', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(82, 196, 26, 0.3)' }}>
                                    <NodeIndexOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(235, 47, 150, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #ffd6e7'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#c41d7f', margin: 0, fontSize: '13px', fontWeight: 600 }}>Trạm dừng nghỉ</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#5c0038' }}>
                                        {totalRestStops} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#434343' }}>trạm</span>
                                    </h2>
                                </div>
                                <div style={{ background: '#eb2f96', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(235, 47, 150, 0.3)' }}>
                                    <EnvironmentOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Card
                            bordered={false}
                            className="dashboard-stat-card"
                            style={{
                                background: 'linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)',
                                boxShadow: '0 4px 12px rgba(245, 34, 45, 0.08)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid #ffa39e'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#cf1322', margin: 0, fontSize: '13px', fontWeight: 600 }}>Biển báo giao thông</p>
                                    <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#5c0011' }}>
                                        {totalSigns} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#434343' }}>biển</span>
                                    </h2>
                                </div>
                                <div style={{ background: '#f5222d', padding: '10px', borderRadius: '10px', color: '#ffffff', fontSize: '20px', display: 'flex', boxShadow: '0 4px 8px rgba(245, 34, 45, 0.3)' }}>
                                    <WarningOutlined />
                                </div>
                            </div>
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
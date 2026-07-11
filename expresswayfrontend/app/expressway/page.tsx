'use client';

import { Card, Row, Col, Typography, Badge, Descriptions, Space, Button, message, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { CompassOutlined, DashboardOutlined, SafetyCertificateOutlined, InfoCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

export interface SectionData {
    SectionId: number;
    ExpresswayId: number;
    NameSection: string;
    Image: string;
    Length: number;
    StartLocation: string;
    StartKm: number;
    EndLocation: string;
    EndKm: number;
    MapData: string;
    interchange: Interchange[];
    restStop: RestStop | null;
}

export interface Interchange {
    InterchangeId: number;
    SectionId: number;
    NameInterchange: string;
    Type: string;
}

export interface RestStop {
    RestStopId: number;
    SectionId: number;
    NameRestStop: string;
}

const ExpresswayPage = () => {
    const [sections, setSections] = useState<SectionData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;

        fetch(`${backendUrl}/sections`)
            .then((res) => {
                if (!res.ok) throw new Error('Không thể lấy dữ liệu từ hệ thống');
                return res.json();
            })
            .then((resData) => {
                setSections(resData.data || []);
                setLoading(false);
            })
            .catch((err) => {
                message.error(err.message || 'Lỗi kết nối API');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" tip="Đang tải danh sách tuyến đường..." />
            </div>
        );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold', color: '#141414' }}>
                        🗺️ Quản Lý Phân Đoạn Cao Tốc
                    </h1>

                    <Row gutter={[16, 16]}>
                        {sections.map((section) => (
                            <Col key={section.SectionId} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: '8px', overflow: 'hidden', height: '100%' }}
                                    cover={
                                        <img
                                            alt={section.NameSection}
                                            src={section.Image ? `${backendUrl}/${section.Image}` : 'https://placehold.co/600x400?text=No+Image'}
                                            style={{ height: '160px', objectFit: 'cover' }}
                                        />
                                    }
                                >
                                    {/* Tiêu đề Ô Tuyến đường */}
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f1f1f' }}>
                                        {section.NameSection}
                                    </h3>

                                    {/* Chiều dài */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <Tag color="green">Chiều dài: {section.Length} km</Tag>
                                    </div>

                                    {/* Chi tiết Điểm đầu - Điểm cuối */}
                                    <div style={{ color: '#595959', fontSize: '13px', marginBottom: '12px' }}>
                                        <p style={{ margin: '4px 0' }}>
                                            <EnvironmentOutlined style={{ color: '#52c41a' }} /> <strong>Đầu:</strong> {section.StartLocation} (Km {section.StartKm})
                                        </p>
                                        <p style={{ margin: '4px 0' }}>
                                            <EnvironmentOutlined style={{ color: '#f5222d' }} /> <strong>Cuối:</strong> {section.EndLocation} (Km {section.EndKm})
                                        </p>
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />

                                    {/* Thống kê nhanh tài sản thông qua mảng quan hệ */}
                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '16px' }}>
                                        <div>🔘 Số nút giao: <strong>{section.interchange?.length || 0}</strong></div>
                                        <div>🏪 Trạm dừng nghỉ: <strong>{section.restStop ? 'Có trạm dừng' : 'Chưa có'}</strong></div>
                                    </div>

                                    {/* Nút điều hướng sang trang chi tiết Bản đồ & Định vị */}
                                    <Button
                                        type="primary"
                                        block
                                        icon={<CompassOutlined />}
                                        onClick={() => {
                                            // Điều hướng hoặc xử lý bật bản đồ cho phân đoạn này
                                            window.location.href = `/dashboard/map?sectionId=${section.SectionId}`;
                                        }}
                                    >
                                        Xem Bản Đồ Tuyến
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default ExpresswayPage;
'use client';

import { Button, Card, Col, Input, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MainLayout from '../layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import "./style.css"
import { SearchOutlined, CompassOutlined, PartitionOutlined, CoffeeOutlined, SafetyCertificateOutlined, DashboardOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Dữ liệu mẫu danh sách cao tốc
const featuredExpressways = [
    {
        id: 101,
        name: 'Pháp Vân – Cầu Giẽ',
        code: 'CT.01',
        length: '32.3 km',
        speed: '100 km/h',
        lanes: '6 làn xe',
        color: '#1890ff',
    },
    {
        id: 102,
        name: 'Cầu Giẽ – Ninh Bình',
        code: 'CT.01',
        length: '50 km',
        speed: '120 km/h',
        lanes: '4 làn xe',
        color: '#52c41a',
    },
    {
        id: 103,
        name: 'TP.HCM – Long Thành – Dầu Giây',
        code: 'CT.01',
        length: '55.7 km',
        speed: '120 km/h',
        lanes: '4 làn xe',
        color: '#fa8c16',
    },
];

export default function HomePage() {
    const [searchKey, setSearchKey] = useState('');

    const handleSearch = () => {
        if (searchKey.trim()) {
            // Chuyển hướng sang trang Map kèm từ khóa tìm kiếm
            window.location.href = `/map?search=${encodeURIComponent(searchKey)}`;
        } else {
            window.location.href = '/map';
        }
    };

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: 60 }}>
                    {/* ------------------------------------------------------------------ */}
                    {/* 1. HERO SECTION */}
                    {/* ------------------------------------------------------------------ */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)',
                            color: '#fff',
                            padding: '80px 20px 100px 20px',
                            textAlign: 'center',
                            position: 'relative',
                        }}
                    >
                        <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <Tag color="blue" style={{ marginBottom: 12, padding: '2px 12px', borderRadius: 12 }}>
                                🚀 Hệ thống Tra cứu Đường cao tốc Việt Nam
                            </Tag>
                            <Title level={1} style={{ color: '#fff', fontSize: '2.5rem', marginBottom: 16 }}>
                                Bản đồ Tra cứu Cao tốc Thông minh & An toàn
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 36 }}>
                                Cập nhật chi tiết giới hạn tốc độ, các nút giao thông ra/vào, vị trí trạm dừng nghỉ
                                và thông tin hỗ trợ tài xế trên toàn quốc 24/7.
                            </Paragraph>

                            {/* Thanh tìm kiếm nhanh */}
                            <div
                                style={{
                                    background: '#fff',
                                    padding: 8,
                                    borderRadius: 32,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    maxWidth: 600,
                                    margin: '0 auto',
                                }}
                            >
                                <Input
                                    placeholder="Nhập tên cao tốc, nút giao (VD: Pháp Vân, Liêm Tuyền)..."
                                    bordered={false}
                                    size="large"
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                    onPressEnter={handleSearch}
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 18, marginRight: 8 }} />}
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    shape="round"
                                    onClick={handleSearch}
                                    style={{ height: 46, paddingLeft: 28, paddingRight: 28, fontWeight: 600 }}
                                >
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
                        {/* ------------------------------------------------------------------ */}
                        {/* 2. KHỐI THỐNG KÊ (STATS OVERLAY) */}
                        {/* ------------------------------------------------------------------ */}
                        <Card
                            style={{
                                marginTop: -50,
                                borderRadius: 16,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                border: 'none',
                            }}
                        >
                            <Row gutter={[16, 24]} justify="space-around" align="middle">
                                <Col xs={12} sm={6} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Tuyến Cao Tốc"
                                        value={24}
                                        prefix={<CompassOutlined style={{ color: '#1890ff' }} />}
                                        suffix="Tuyến"
                                    />
                                </Col>
                                <Col xs={12} sm={6} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Nút Giao Thông"
                                        value={180}
                                        prefix={<PartitionOutlined style={{ color: '#ff4d4f' }} />}
                                        suffix="Điểm"
                                    />
                                </Col>
                                <Col xs={12} sm={6} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Trạm Dừng Nghỉ"
                                        value={45}
                                        prefix={<CoffeeOutlined style={{ color: '#52c41a' }} />}
                                        suffix="Trạm"
                                    />
                                </Col>
                                <Col xs={12} sm={6} style={{ textAlign: 'center' }}>
                                    <Statistic
                                        title="Cập Nhật Dữ Liệu"
                                        value="24/7"
                                        prefix={<SafetyCertificateOutlined style={{ color: '#fa8c16' }} />}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* ------------------------------------------------------------------ */}
                        {/* 3. TÍNH NĂNG NỔI BẬT */}
                        {/* ------------------------------------------------------------------ */}
                        <div style={{ marginTop: 60 }}>
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <Title level={2}>Tính Năng Hỗ Trợ Lái Xe</Title>
                                <Text type="secondary">Giải pháp toàn diện giúp chuyến đi cao tốc của bạn suôn sẻ và an toàn hơn</Text>
                            </div>

                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={8}>
                                    <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                                        <div style={{ fontSize: 36, color: '#1890ff', marginBottom: 16 }}>
                                            <DashboardOutlined />
                                        </div>
                                        <Title level={4}>Tra Cứu Biển Báo Tốc Độ</Title>
                                        <Paragraph type="secondary">
                                            Hiển thị chi tiết quy định tốc độ tối đa/tối thiểu cho từng phân đoạn cao tốc, hạn chế nguy cơ vi phạm.
                                        </Paragraph>
                                    </Card>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                                        <div style={{ fontSize: 36, color: '#ff4d4f', marginBottom: 16 }}>
                                            <PartitionOutlined />
                                        </div>
                                        <Title level={4}>Sơ Đồ Nút Giao Phức Tạp</Title>
                                        <Paragraph type="secondary">
                                            Định vị chính xác các điểm rẽ ra/vào cao tốc, giúp tài xế chủ động chuyển làn sớm, tránh đi quá lối rẽ.
                                        </Paragraph>
                                    </Card>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Card hoverable style={{ height: '100%', borderRadius: 12 }}>
                                        <div style={{ fontSize: 36, color: '#52c41a', marginBottom: 16 }}>
                                            <CoffeeOutlined />
                                        </div>
                                        <Title level={4}>Định Vị Trạm Dừng Nghỉ</Title>
                                        <Paragraph type="secondary">
                                            Tìm kiếm trạm dừng nghỉ gần nhất trên hành trình với đầy đủ thông tin về cây xăng, nhà ăn, vệ sinh.
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        {/* ------------------------------------------------------------------ */}
                        {/* 4. TUYẾN CAO TỐC NỔI BẬT */}
                        {/* ------------------------------------------------------------------ */}
                        <div style={{ marginTop: 60 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                                <div>
                                    <Title level={2} style={{ marginBottom: 4 }}>Tuyến Cao Tốc Tiêu Biểu</Title>
                                    <Text type="secondary">Các tuyến đường huyết mạch có lượt lưu thông lớn nhất</Text>
                                </div>
                                <Button type="link" href="/map" style={{ paddingRight: 0 }}>
                                    Xem tất cả bản đồ <RightOutlined />
                                </Button>
                            </div>

                            <Row gutter={[24, 24]}>
                                {featuredExpressways.map((item) => (
                                    <Col xs={24} sm={12} md={8} key={item.id}>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: 12, overflow: 'hidden' }}
                                            actions={[
                                                <Button type="link" href={`/map?id=${item.id}`} key="view">
                                                    Mở trên bản đồ <RightOutlined />
                                                </Button>,
                                            ]}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Tag color={item.color} style={{ fontWeight: 600 }}>{item.code}</Tag>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.lanes}</Text>
                                                </div>
                                                <Title level={4} style={{ margin: '8px 0 4px 0' }}>{item.name}</Title>
                                                <Space split={<Text type="secondary">•</Text>}>
                                                    <Text style={{ fontSize: 13 }}>Chiều dài: <b>{item.length}</b></Text>
                                                    <Text style={{ fontSize: 13 }}>Tối đa: <b>{item.speed}</b></Text>
                                                </Space>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        <Card
                            style={{
                                marginTop: 60,
                                borderRadius: 16,
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                textAlign: 'center',
                                padding: '24px 0',
                            }}
                        >
                            <Title level={3} style={{ color: '#fff', marginBottom: 12 }}>
                                Sẵn Sàng Cho Chuyến Đi An Toàn?
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 24 }}>
                                Trải nghiệm ngay bản đồ tương tác trực quan với đầy đủ tính năng định vị vị trí hiện tại của bạn.
                            </Paragraph>
                            <Button
                                size="large"
                                style={{ color: '#096dd9', fontWeight: 600, borderRadius: 24, padding: '0 36px' }}
                                href="/map"
                            >
                                Trải Nghệm Bản Đồ Ngay
                            </Button>
                        </Card>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
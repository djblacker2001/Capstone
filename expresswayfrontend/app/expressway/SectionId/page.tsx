'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col, Typography, Badge, Descriptions, Space } from 'antd';
import { useState } from 'react';
import "./style.css";
import { CompassOutlined, DashboardOutlined, SafetyCertificateOutlined, InfoCircleOutlined } from '@ant-design/icons';
import MainLayout from '@/app/layout/Layout';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            Creating the map...
        </div>
    )
});

const { Title, Text } = Typography;
interface SectionDetail {
    SectionId: number;
    ExpresswayId: number;
    NameSection: string;
    Image: string;
    Length: number;
    StartLocation: string;
    StartKm: number;
    EndLocation: string;
    EndKm: number;
    SpeedLimit: string;
    TrafficLand: number;
    HasEmergencyLand: boolean;
    Status: 'Complete' | 'Extend under construction' | 'Under construction';
    MapData: string;
    Interchange?: any[];
    RestStop?: any;
}

const ExpresswayPage = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const data: SectionDetail = {
        SectionId: 101,
        ExpresswayId: 100,
        NameSection: "Pháp Vân - Cầu Giẽ",
        Image: "uploads/signs/phapvancaugietocdo.png",
        Length: 30,
        StartLocation: "IC Pháp Vân",
        StartKm: 182,
        EndLocation: "IC Đại Xuyên",
        EndKm: 211.7,
        SpeedLimit: "60 - 100 km/h",
        TrafficLand: 6,
        HasEmergencyLand: true,
        Status: "Complete",
        MapData: 'uploads/maps/phapvancaugie.json'
    };10

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Complete':
                return <Badge status="success" text="Active / Complete" />;
            case 'Extend under construction':
                return <Badge status="warning" text="Extending" />;
            default:
                return <Badge status="processing" text="Under Construction" />;
        }
    };

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '20px', position: 'relative' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: '24px' }} className="flex flex-col gap-6">
                                <div style={{ width: '100%', height: '100%', border: '4px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    <img src="http://localhost:8080/uploads/ways/phapvancaugie.jpg" alt="" />
                                </div>
                                <div style={{ width: '100%', height: '100%', border: '4px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    <img src="http://localhost:8080/uploads/signs/phapvancaugietocdo.png" alt="" />
                                </div>
                                <div className="map-wrapper">
                                    <div className={isFullscreen ? 'map-expanded' : 'map-small'}>
                                        <DynamicMapContainer
                                            isFullscreen={isFullscreen}
                                            setIsFullscreen={setIsFullscreen}
                                            geojsonData={data.MapData}
                                        />
                                    </div>

                                    {!isFullscreen && (
                                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setIsFullscreen(true); }} style={{ color: '#007bff', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}>
                                                Full screen
                                            </a>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </Col>
                        <Col xs={24} md={16} lg={18}>
                            <Card
                                style={{
                                    minHeight: '650px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    width: '100%',
                                    border: 'none',
                                    background: '#ffffff'
                                }}
                            >
                                <div style={{ width: '100%', padding: '0 20px' }}>
                                    <Space direction="vertical" size="small" style={{ marginBottom: '24px' }}>
                                        <Space>
                                            <CompassOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <Title level={3} style={{ margin: 0 }}>
                                                EXPRESSWAY SECTION DETAILS
                                            </Title>
                                        </Space>
                                    </Space>
                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="middle"
                                        labelStyle={{ background: '#f5f5f5', fontWeight: 600, width: '200px' }}
                                    >
                                        <Descriptions.Item label="Section Name">
                                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>{data.NameSection}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Total Length">
                                            <Space>
                                                <Text strong>{data.Length}</Text>
                                                <Text type="secondary">Km</Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Route Markers">
                                            <Space split={<Text type="secondary">→</Text>}>
                                                <Text>{data.StartLocation} <Text type="secondary">(Km {data.StartKm})</Text></Text>
                                                <Text>{data.EndLocation} <Text type="secondary">(Km {data.EndKm})</Text></Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Lanes Configuration">
                                            <Space direction="vertical" size={0}>
                                                <Text>{data.TrafficLand} Main Traffic Lanes</Text>
                                                {data.HasEmergencyLand && (
                                                    <Text type="success" style={{ fontSize: '13px' }}>
                                                        <SafetyCertificateOutlined /> Includes Emergency Shoulder Lanes
                                                    </Text>
                                                )}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Operation Status">
                                            {getStatusBadge(data.Status)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default ExpresswayPage;
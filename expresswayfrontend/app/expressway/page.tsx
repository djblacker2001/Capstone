'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col, Typography, Badge, Descriptions, Space } from 'antd';
import { useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { CompassOutlined, DashboardOutlined, SafetyCertificateOutlined, InfoCircleOutlined } from '@ant-design/icons';

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
    sectionId: number;
    expresswayId: number;
    nameSection: string;
    image: string;
    length: number;
    startLocation: string;
    startKm: number;
    endLocation: string;
    endKm: number;
    speedLimit: string;
    trafficLand: number;
    hasEmergencyLand: boolean;
    status: 'Complete' | 'Extend under construction' | 'Under construction';
    mapData: string;
}

const ExpresswayPage = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const rawMapData = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [
                [105.8492795, 20.9656187],
                [105.918852, 20.70399]
            ]
        }
    };

    const data: SectionDetail = {
        sectionId: 101,
        expresswayId: 100,
        nameSection: "Pháp Vân - Cầu Giẽ",
        image: "uploads/signs/phapvancaugietocdo.png",
        length: 30,
        startLocation: "IC Pháp Vân",
        startKm: 182,
        endLocation: "IC Đại Xuyên",
        endKm: 211.7,
        speedLimit: "60 - 100 km/h",
        trafficLand: 6,
        hasEmergencyLand: true,
        status: "Complete",
        mapData: '{"type": "Feature","geometry": {"type": "LineString","coordinates": [[105.8492795, 20.9656187],[105.918852, 20.70399]]}}'
    };

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
                                            geojsonData={rawMapData}
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
                                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>{data.nameSection}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Total Length">
                                            <Space>
                                                <Text strong>{data.length}</Text>
                                                <Text type="secondary">Km</Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Route Markers">
                                            <Space split={<Text type="secondary">→</Text>}>
                                                <Text>{data.startLocation} <Text type="secondary">(Km {data.startKm})</Text></Text>
                                                <Text>{data.endLocation} <Text type="secondary">(Km {data.endKm})</Text></Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Lanes Configuration">
                                            <Space direction="vertical" size={0}>
                                                <Text>{data.trafficLand} Main Traffic Lanes</Text>
                                                {data.hasEmergencyLand && (
                                                    <Text type="success" style={{ fontSize: '13px' }}>
                                                        <SafetyCertificateOutlined /> Includes Emergency Shoulder Lanes
                                                    </Text>
                                                )}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Operation Status">
                                            {getStatusBadge(data.status)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    <style jsx>{`
                    .map-small {
                        width: 100%;
                        height: 200px;
                        border: 4px solid black; 
                        overflow: hidden;
                        position: relative;
                        transition: all 0.4s ease-in-out;
                    }
                    .map-expanded {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        z-index: 9999;
                        background: white;
                        transition: all 0.4s ease-in-out;
                    }
                `}</style>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default ExpresswayPage;
'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col } from 'antd';
import { useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            Đang khởi tạo bản đồ...
        </div>
    )
});

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

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '20px', position: 'relative' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: '24px' }} className="flex flex-col gap-6">
                                <div style={{ width: '100%', height: '200px', border: '4px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    Avatar Expressway
                                </div>
                                <div style={{ width: '100%', height: '200px', border: '4px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    Hình biển báo tốc độ
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
                                                Xem bản đồ toàn màn hình
                                            </a>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </Col>
                        <Col xs={24} md={16} lg={18}>
                            <Card style={{ minHeight: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Thông tin chi tiết đoạn đường</h2>
                            </Card>
                        </Col>
                    </Row>
                    <style jsx>{`
                    .map-small {
                        width: 100%;
                        height: 200px; /* Khớp chuẩn chiều cao với các box trên */
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
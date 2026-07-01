"use client";

import { ArrowRightOutlined, CompassOutlined, GlobalOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState } from 'react';
import { Typography, Button, Row, Col, Card, Statistic, List, Badge } from 'antd';
import Layout from "./layout/Layout";
import "./style.css";
import dynamic from "next/dynamic";
import expresswayGeoData from "./expressway-data.json";

const { Title, Paragraph, Text } = Typography;

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      Đang khởi tạo bản đồ GIS...
    </div>
  )
});

export default function Home() {
  const [activeRoute, setActiveRoute] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ĐỔI: Tọa độ thực tế theo đường đi gấp khúc (chứ không phải đường thẳng)

  const routesData = [
    { id: 1, name: 'Cao tốc Bắc – Nam (Phía Đông)', desc: 'Quy mô: Tuyến xương sống quốc gia', tag: 'Trọng điểm' },
  ];

  return (
    <>
      <Layout>
        <main className="landing-body-container">

          {/* 1. HERO TEXT SECTION */}
          <section className="hero-text-section">
            <Typography>
              <Title level={1} className="hero-title">
                Hệ Thống Quản Lý Dữ Liệu Không Gian<br />
                <span className="text-emerald">Hạ Tầng Đường Cao Tốc Việt Nam</span>
              </Title>
              <Paragraph className="hero-desc">
                Hệ thống hỗ trợ số hóa, tra cứu tọa độ lý trình, theo dõi tiến độ thi công và
                quản lý các lớp tài sản hạ tầng kỹ thuật trực quan trên nền tảng bản đồ GIS.
              </Paragraph>
            </Typography>
            <div className="hero-btns-group">
              <Button type="primary" size="large" icon={<CompassOutlined />} href="/map" className="btn-emerald">
                Truy Cập Bản Đồ
              </Button>
              <Button type="default" size="large" icon={<ArrowRightOutlined />} href="#discover">
                Tìm Hiểu Thêm
              </Button>
            </div>
          </section>

          {/* 2. REAL-TIME STATS CARDS */}
          <section className="stats-cards-section">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="antd-stat-card">
                  <Statistic
                    title="Tuyến Cao Tốc Số Hóa"
                    value={1245}
                    suffix="KM"
                    prefix={<GlobalOutlined className="icon-emerald" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="antd-stat-card">
                  <Statistic
                    title="Hạ Tầng Kỹ Thuật"
                    value={482}
                    suffix="Điểm"
                    prefix={<InfoCircleOutlined className="icon-emerald" />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="antd-stat-card">
                  <Statistic
                    title="Uptime Hệ Thống GIS"
                    value={99.9}
                    suffix="%"
                    prefix={<CompassOutlined className="icon-emerald" />}
                  />
                </Card>
              </Col>
            </Row>
          </section>

          {/* 3. INTERACTIVE GIS PREVIEW SECTION */}
          <section id="discover" className="gis-preview-section">
            <div className="section-header">
              <Title level={2}>Hệ Thống Bản Đồ Trực Quan</Title>
              <Text type="secondary">Chọn một tuyến cao tốc bất kỳ để trải nghiệm tính năng định vị không gian</Text>
            </div>

            <Row gutter={[24, 24]} className="gis-layout-grid">
              <Col xs={24} md={8}>
                <List
                  dataSource={routesData}
                  renderItem={(item) => (
                    <List.Item
                      className={`route-list-item ${activeRoute === item.id ? 'item-active' : ''}`}
                      onClick={() => setActiveRoute(item.id)}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{item.name}</Text>
                          {item.tag && <Badge count={item.tag} style={{ backgroundColor: '#f5222d' }} />}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
                {!isFullscreen && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsFullscreen(true); }} style={{ color: '#007bff', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}>
                      Full screen
                    </a>
                  </div>
                )}
              </Col>

              <Col xs={24} md={16}>
                <div className={`map-container-holder ${isFullscreen ? 'map-expanded' : 'map-small'}`}>
                  <DynamicMapContainer
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    geojsonData={expresswayGeoData}
                  />
                </div>
              </Col>
            </Row>
          </section>

        </main>
      </Layout>
    </>
  );
}
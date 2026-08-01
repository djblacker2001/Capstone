"use client";

import { ArrowRightOutlined, CompassOutlined, GlobalOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Card, Statistic, List, Badge, Spin } from 'antd';
import Layout from "./layout/Layout";
import "./style.css";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import axiosClient from "@/api/axiosClient";

const { Title, Paragraph, Text } = Typography;

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      Đang tải dữ liệu bản đồ GIS từ Server...
    </div>
  )
});

interface Expressway {
  ExpresswayId: number;
  NameExpressway: string;
  Symbol?: string | null;
  Description?: string | null;
  Tag?: string | null;
  MapData?: any;
  section?: any[];
}

export default function Home() {
  const [routesData, setRoutesData] = useState<Expressway[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchExpressways = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/expressways");
        const data: Expressway[] = Array.isArray(res) 
          ? res 
          : Array.isArray(res.data) 
            ? res.data 
            : res.data?.data || [];

        setRoutesData(data);

        if (data.length > 0) {
          setActiveRouteId(data[0].ExpresswayId);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách cao tốc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpressways();
  }, []);

  const selectedExpressway = routesData.find(item => item.ExpresswayId === activeRouteId);

  return (
    <>
      <Layout>
        <main className="landing-body-container">
          <section className="hero-text-section">
            <Typography>
              <Title level={1} className="hero-title">
                {t("landing.title1")}<br />
                <span className="text-emerald">{t("landing.title2")}</span>
              </Title>
              <Paragraph className="hero-desc">{t("landing.text1")}</Paragraph>
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

          <section id="discover" className="gis-preview-section">
            <div className="section-header">
              <Title level={2}>Hệ Thống Bản Đồ Trực Quan</Title>
              <Text type="secondary">Chọn một tuyến cao tốc bất kỳ để hiển thị vị trí dữ liệu không gian từ API</Text>
            </div>

            <Row gutter={[24, 24]} className="gis-layout-grid">
              <Col xs={24} md={8}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="Đang kết nối API cao tốc..." />
                  </div>
                ) : (
                  <List
                    dataSource={routesData}
                    style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '8px' }}
                    renderItem={(item) => {
                      const isActive = activeRouteId === item.ExpresswayId;

                      return (
                        <List.Item
                          key={item.ExpresswayId}
                          className={`route-list-item ${isActive ? 'item-active' : ''}`}
                          onClick={() => setActiveRouteId(item.ExpresswayId)}
                          style={{ 
                            cursor: 'pointer', 
                            transition: 'all 0.3s',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            padding: '12px'
                          }}
                        >
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <Text strong style={{ color: isActive ? '#0A9646' : '#262626', fontSize: '14px', flex: 1 }}>
                                {item.NameExpressway}
                              </Text>
                              {item.Symbol && (
                                <Badge 
                                  count={item.Symbol} 
                                  style={{ 
                                    backgroundColor: isActive ? '#0A9646' : '#52c41a', 
                                    fontWeight: 600 
                                  }} 
                                />
                              )}
                            </div>

                            <div style={{ marginTop: '6px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {item.Description || (item.section && item.section.length > 0 
                                  ? `Gồm ${item.section.length} phân đoạn tuyến` 
                                  : 'Tuyến đường cao tốc quốc gia')}
                              </Text>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                )}

                {!isFullscreen && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setIsFullscreen(true); }}
                      style={{ color: '#0A9646', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}
                    >
                      Toàn màn hình
                    </a>
                  </div>
                )}
              </Col>

              <Col xs={24} md={16}>
                <div className={`map-container-holder ${isFullscreen ? 'map-expanded' : 'map-small'}`}>
                  <DynamicMapContainer
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    mapDataFromApi={selectedExpressway?.MapData}
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
"use client";

import { AppstoreOutlined, ArrowRightOutlined, CheckCircleOutlined, CompassOutlined, DashboardOutlined, GlobalOutlined, InfoCircleOutlined, ToolOutlined, WarningOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from 'react';
import { Typography, Button, Row, Col, Card, Statistic, List, Badge, Spin, message, Empty, Table, Tag, Flex, Carousel } from 'antd';
import Layout from "./layout/Layout";
import "./style.css";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import axiosClient from "@/api/axiosClient";

const { Title, Paragraph, Text } = Typography;
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      Loading...
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
  const [images, setImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [routesData, setRoutesData] = useState<Expressway[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  const sectionColumns = useMemo(() => [
    {
      title: <span suppressHydrationWarning>{t("home.sectionName")}</span>,
      dataIndex: 'NameSection',
      key: 'NameSection',
      render: (text: any) => <strong>{text || 'Chưa cập nhật'}</strong>,
    },
    {
      title: <span suppressHydrationWarning>{t("home.route")}</span>,
      key: 'route',
      render: (_: any, record: { StartLocation: any; EndLocation: any; }) => (
        <span>
          {record.StartLocation || 'N/A'} &rarr; {record.EndLocation || 'N/A'}
        </span>
      ),
    },
    {
      title: <span suppressHydrationWarning>{t("home.length")}</span>,
      dataIndex: 'Length',
      key: 'Length',
      width: 100,
      render: (len: any) => (len ? `${len} km` : '-'),
    },
  ], [t]);

  const fetchHeroImages = async () => {
    try {
      setImageLoading(true);
      const response = await fetch(`${baseUrl}/uploads/`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        let rawData: string[] = result.data;
        const savedOrder = localStorage.getItem('hero_images_order');
        if (savedOrder) {
          const parsedOrder: string[] = JSON.parse(savedOrder);
          const ordered = parsedOrder.filter((filename) => rawData.includes(filename));
          const rest = rawData.filter((filename) => !ordered.includes(filename));
          rawData = [...ordered, ...rest];
        }

        const fullImageUrls = rawData.map((fileName: string) => `${baseUrl}/uploads/images/${fileName}`);
        setImages(fullImageUrls);
      } else {
        setImages(['/backgroundhome.png', '/backgroundhome2.png']);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách ảnh hero background:", error);
      setImages(['/backgroundhome.png', '/backgroundhome2.png']);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resStats, resIncident, resMaintenance] = await Promise.all([
        fetch(`${baseUrl}/expressways/statistics`),
        fetch(`${baseUrl}/sections/search?status=Incident`),
        fetch(`${baseUrl}/sections/search?status=Maintenance`)
      ]);

      if (!resStats.ok) throw new Error('Không thể lấy dữ liệu thống kê');

      const resultStats = await resStats.json();
      const dataIncident = await resIncident.json();
      const dataMaintenance = await resMaintenance.json();

      setStatsData(resultStats.data || resultStats);
      setIncidents(dataIncident?.data?.data || []);
      setMaintenances(dataMaintenance?.data?.data || []);
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      message.error('Lỗi khi tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpressways = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchExpressways();
    fetchHeroImages();
  }, []);

  const selectedExpressway = routesData.find(item => item.ExpresswayId === activeRouteId);
  const totalLength = statsData?.totalSystemLength ? statsData.totalSystemLength.toFixed(1) : '0.0';

  const completedSections = statsData?.totalSectionsCompleted || 0;
  const totalSections = statsData?.totalSections || 1;
  const operationalRate = ((completedSections / totalSections) * 100).toFixed(1);

  return (
    <>
      <Layout>
        <main className="landing-body-container">
          <section className="hero-text-section">
            <div className="hero-bg-carousel">
              {imageLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Carousel autoplay dots={true} speed={800} autoplaySpeed={4000}>
                  {images.map((imgSrc, index) => (
                    <div key={index} style={{ height: '100%' }}>
                      <div
                        className="carousel-slide-item"
                        style={{ backgroundImage: `url(${imgSrc})` }}
                      />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
            <div className="hero-overlay" />
            <div className="hero-content">
              <Typography>
                <Title level={1} className="hero-title">
                  <span suppressHydrationWarning>{t("home.title1")}</span>
                  <br />
                  <span className="text-emerald" suppressHydrationWarning>{t("home.title2")}</span>
                </Title>
                <Paragraph className="hero-desc"><span suppressHydrationWarning>{t("home.text1")}</span></Paragraph>
              </Typography>
              <div className="hero-btns-group">
                <Button type="primary" size="large" icon={<CompassOutlined />} href="/map" className="btn-emerald">
                  <span suppressHydrationWarning>{t("home.mapAccess")}</span>
                </Button>
                <Button type="default" size="large" icon={<ArrowRightOutlined />} href="#discover" className="btn-learnMore">
                  <span suppressHydrationWarning>{t("home.learnMore")}</span>
                </Button>
              </div>
            </div>
          </section>

          <section className="stats-cards-section">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} sm={12} md={8}>
                <Card
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 168, 89, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid #00a859'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: '#00a859', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                        <span suppressHydrationWarning>{t("home.totalLength")}</span>
                      </p>
                      <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#00a859' }}>
                        {totalLength} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>Km</span>
                      </h2>
                    </div>
                    <div style={{ background: '#00a859', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '20px', display: 'flex' }}>
                      <DashboardOutlined />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card
                  style={{
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid #00a859'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: '#00a859', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                        <span suppressHydrationWarning>{t("home.progress")}</span>
                      </p>
                      <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#00a859' }}>
                        {operationalRate} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>%</span>
                      </h2>
                    </div>
                    <div style={{ background: '#00a859', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '20px', display: 'flex' }}>
                      <CheckCircleOutlined />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card
                  style={{
                    boxShadow: '0 4px 12px rgba(114, 46, 209, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid #00a859'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: '#00a859', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                        <span suppressHydrationWarning>{t("home.infrastructure")}</span>
                      </p>
                      <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#00a859' }}>
                        482 <span suppressHydrationWarning style={{ fontSize: '14px', fontWeight: 'normal' }}>{t("home.score")}</span>
                      </h2>
                    </div>
                    <div style={{ background: '#00a859', padding: '10px', borderRadius: '10px', color: '#fff', fontSize: '20px', display: 'flex' }}>
                      <AppstoreOutlined />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </section>

          <section className="tables-status-section">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span suppressHydrationWarning style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <WarningOutlined /> {t("home.incident")} ({incidents.length})
                    </span>
                  }
                  style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <Table
                    columns={sectionColumns}
                    dataSource={incidents}
                    rowKey="id"
                    pagination={false}
                    locale={{
                      emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Incident Expressway" />
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <span suppressHydrationWarning style={{ color: '#722ed1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ToolOutlined /> {t("home.maintenance")} ({maintenances.length})
                    </span>
                  }
                  style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <Table
                    columns={sectionColumns}
                    dataSource={maintenances}
                    rowKey="id"
                    pagination={false}
                    locale={{
                      emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Maintenance Expressway" />
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </section>

          <section id="discover" className="gis-preview-section">
            <div className="section-header">
              <Title suppressHydrationWarning level={2}>{t("home.mapSystem")}</Title>
            </div>

            <Row gutter={[24, 24]} className="gis-layout-grid">
              <Col xs={24} md={8}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin description="Đang kết nối API cao tốc..." />
                  </div>
                ) : (
                  <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '8px' }}>
                    <Flex vertical gap={0}>
                      {routesData?.map((item) => {
                        const isActive = activeRouteId === item.ExpresswayId;

                        return (
                          <div
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
                          </div>
                        );
                      })}
                    </Flex>
                  </div>
                )}

                {!isFullscreen && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setIsFullscreen(true); }}
                      style={{ color: '#0A9646', textDecoration: 'underline', fontSize: '14px', fontWeight: 500 }}
                    >
                      <span suppressHydrationWarning>{t("home.fullScreen")}</span>
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
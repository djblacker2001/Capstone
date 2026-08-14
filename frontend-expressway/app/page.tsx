"use client";

import { AppstoreOutlined, ArrowRightOutlined, CheckCircleOutlined, CompassOutlined, DashboardOutlined, GlobalOutlined, InfoCircleOutlined, ToolOutlined, WarningOutlined } from "@ant-design/icons";
import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { Typography, Button, Row, Col, Card, Statistic, List, Badge, Spin, message, Empty, Table, Tag } from 'antd';
import Layout from "./layout/Layout";
import "./style.css";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import axiosClient from "@/api/axiosClient";
import { t } from "i18next";


const { Title, Paragraph, Text } = Typography;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const [statsData, setStatsData] = useState<any>(null);
  const [incidents, setIncidents] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [routesData, setRoutesData] = useState<Expressway[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();
  const sectionColumns = [
    {
      title: `${t("home.sectionName")}`,
      dataIndex: 'NameSection',
      key: 'NameSection',
      render: (text: any) => <strong>{text || 'Chưa cập nhật'}</strong>,
    },
    {
      title: `${t("home.route")}`,
      key: 'route',
      render: (_: any, record: { StartLocation: any; EndLocation: any; }) => (
        <span>
          {record.StartLocation || 'N/A'} &rarr; {record.EndLocation || 'N/A'}
        </span>
      ),
    },
    {
      title: `${t("home.length")}`,
      dataIndex: 'Length',
      key: 'Length',
      width: 100,
      render: (len: any) => (len ? `${len} km` : '-'),
    },
  ];

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resStats, resIncident, resMaintenance] = await Promise.all([
        fetch(`${baseUrl}/expressways/statistics`),
        fetch(`${baseUrl}/sections/search?status=Incident`),
        fetch(`${baseUrl}/sections/search?status=Maintainance`)
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

  useEffect(() => {
    fetchAllData();
    fetchExpressways();
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
            <Typography>
              <Title level={1} className="hero-title">
                {t("home.title1")}<br />
                <span className="text-emerald">{t("home.title2")}</span>
              </Title>
              <Paragraph className="hero-desc">{t("home.text1")}</Paragraph>
            </Typography>
            <div className="hero-btns-group">
              <Button type="primary" size="large" icon={<CompassOutlined />} href="/map" className="btn-emerald">
                {t("home.mapAccess")}
              </Button>
              <Button type="default" size="large" icon={<ArrowRightOutlined />} href="#discover" className="btn-learnMore">
                {t("home.learnMore")}
              </Button>
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
                        {t("home.totalLength")}
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
                        {t("home.progress")}
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
                        {t("home.infrastructure")}
                      </p>
                      <h2 style={{ fontSize: '26px', margin: '8px 0 0 0', fontWeight: '700', color: '#00a859' }}>
                        482 <span style={{ fontSize: '14px', fontWeight: 'normal' }}>Điểm</span>
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
                    <span style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <span style={{ color: '#722ed1', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <Title level={2}>{t("home.mapSystem")}</Title>
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
                      {t("home.fullScreen")}
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
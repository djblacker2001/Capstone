'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col, Typography, Badge, Descriptions, Space, Tabs, Table, Tag, Spin, Alert, Flex } from 'antd';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import "./style.css";
import { CompassOutlined, SafetyCertificateOutlined, BranchesOutlined, CoffeeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import MainLayout from '@/app/layout/Layout';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarTunnel, faCodeBranch, faGasPump, faRoadBridge } from '@fortawesome/free-solid-svg-icons';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            Creating the map...
        </div>
    )
});

const { Title, Text } = Typography;

export default function ExpresswayPage() {
    const params = useParams();
    const rawId = params?.id;
    const currentId = Array.isArray(rawId) ? rawId[0] : rawId;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [data, setData] = useState<SectionDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchSectionDetail = async () => {
            if (!currentId) return;

            try {
                setLoading(true);
                setError(null);

                const apiUrl = `${baseUrl}/sections/${currentId}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

                const result = await response.json();
                const sectionData = result?.data || result;

                if (Array.isArray(sectionData)) {
                    const found = sectionData.find((item: any) => String(item.SectionId) === String(currentId));
                    setData(found || sectionData[0] || null);
                } else {
                    setData(sectionData);
                }

            } catch (err: any) {
                setError(err.message || 'Có lỗi xảy ra khi kết nối tới máy chủ');
            } finally {
                setLoading(false);
            }
        };

        fetchSectionDetail();
    }, [currentId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Complete':
                return <Badge color= '#237804' text={t("expressway.complete")} />;
            case 'Under construction':
                return <Badge color= '#1890ff' text={t("expressway.underConstruction")} />;
            case 'Extend under construction':
                return <Badge color= '#86c5ff' text={t("expressway.extendUnderConstruction")} />;
            case 'Not yet construction':
                return <Badge color= '#faad14' text={t("expressway.notYetConstruction")} />;
            case 'Incident':
                return <Badge color= '#ff4d4f' text={t("expressway.incident")} />;
            case 'Maintenance':
                return <Badge color= '#722ed1' text={t("expressway.maintenance")} />;
            default:
                return <Badge status="default" text={status} />;
        }
    };

    const getImageUrl = (path?: string | null) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    };

    const interchangeColumns = [
        {
            title: t("section.interchangeName"),
            dataIndex: 'NameInterchange',
            key: 'NameInterchange',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: t("map.location"),
            dataIndex: 'Location',
            key: 'Location',
            sorter: (a: InterchangeItem, b: InterchangeItem) => {
                const kmA = parseFloat(String(a.Location || '').replace(/[^\d.-]/g, '')) || 0;
                const kmB = parseFloat(String(b.Location || '').replace(/[^\d.-]/g, '')) || 0;
                return kmA - kmB;
            },
            defaultSortOrder: 'ascend' as const,
            render: (km: string) => <Tag color="blue">{km?.startsWith('Km') ? km : `Km ${km}`}</Tag>
        },
        {
            title: t("section.type"),
            dataIndex: 'Type',
            key: 'Type'
        },
        {
            title: t("section.connection"),
            dataIndex: 'Connection',
            key: 'Connection',
            render: (text: string) => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
        },
        {
            title: t("section.bot"),
            dataIndex: 'BOT',
            key: 'BOT',
            render: (bot: string) => (
                <Tag color={bot === 'Operating' ? 'green' : 'default'}>
                    {bot === 'Operating' ? t("section.yes") : t("section.no")}
                </Tag>
            )
        },
        {
            title: t("expressway.status"),
            dataIndex: 'Status',
            key: 'Status',
            render: (status: string) => getStatusBadge(status)
        },
        {
            title: `${t("section.coordinates")} (Lat, Lng)`,
            key: 'coordinates',
            render: (_: any, record: InterchangeItem) => (
                record.Latitude && record.Longitude ? (
                    <Tag icon={<EnvironmentOutlined />} color="cyan">
                        {record.Latitude.toFixed(4)}, {record.Longitude.toFixed(4)}
                    </Tag>
                ) : <Text type="secondary">{t("section.notYetUpdate")}</Text>
            )
        },
    ];

    const restStopColumns = [
        {
            title: t("section.restStopName"),
            dataIndex: 'NameRestStop',
            key: 'NameRestStop',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: t("map.location"),
            dataIndex: 'Location',
            key: 'Location',
            sorter: (a: RestStopItem, b: RestStopItem) => {
                const kmA = parseFloat(String(a.Location || '').replace(/[^\d.-]/g, '')) || 0;
                const kmB = parseFloat(String(b.Location || '').replace(/[^\d.-]/g, '')) || 0;
                return kmA - kmB;
            },
            defaultSortOrder: 'ascend' as const,
            render: (km: string) => <Tag color="green">{km?.startsWith('Km') ? km : `Km ${km}`}</Tag>
        },
        {
            title: t("section.service"),
            key: 'services',
            render: (_: any, record: RestStopItem) => (
                <Space wrap>
                    {record.HasPetrol && <Tag color="orange">⛽ {t("section.fuel")}</Tag>}
                    {record.HasFood && <Tag color="blue">🍽️ {t("section.food")}</Tag>}
                    {record.HasToilet && <Tag color="cyan">🚾 {t("section.toilet")}</Tag>}
                </Space>
            )
        },
        {
            title: t("expressway.status"),
            dataIndex: 'Status',
            key: 'Status',
            render: (status: string) => (
                <Tag color={status === 'Operating' ? 'success' : 'processing'}>
                    {status === 'Operating' ? 'Đang hoạt động' : status}
                </Tag>
            )
        },
        {
            title: `${t("section.coordinates")} (Lat, Lng)`,
            key: 'coordinates',
            render: (_: any, record: RestStopItem) => (
                record.Latitude && record.Longitude ? (
                    <Tag icon={<EnvironmentOutlined />} color="purple">
                        {record.Latitude.toFixed(6)}, {record.Longitude.toFixed(6)}
                    </Tag>
                ) : <Text type="secondary">{t("section.notYetUpdate")}</Text>
            )
        },
    ];

    const bridgeColumns = [
        {
            title: t("section.bridgeName"),
            dataIndex: 'NameBridge',
            key: 'NameBridge',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: `${t("expressway.length")} (m)`,
            dataIndex: 'Length',
            key: 'Length',
            render: (len: number) => <Tag color="blue">{len} m</Tag>
        },
        {
            title: t("section.type"),
            dataIndex: 'Type',
            key: 'Type',
            render: (type: string) => <Tag color="orange">{type}</Tag>
        },
        {
            title: t("section.overcrowd"),
            dataIndex: 'Crossing',
            key: 'Crossing'
        },
    ];

    const tunnelColumns = [
        {
            title: t("section.tunnelName"),
            dataIndex: 'NameTunnel',
            key: 'NameTunnel',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: `${t("expressway.length")} (m)`,
            dataIndex: 'Length',
            key: 'Length',
            render: (len: number) => <Tag color="purple">{len} m</Tag>
        },
        {
            title: `${t("section.height")} (m)`,
            dataIndex: 'Height',
            key: 'Height',
            render: (h: number) => `${h} m`
        },
        {
            title: `${t("section.speed")} (${t("section.minmax")})`,
            key: 'Speed',
            render: (_: any, record: any) => `${record.MinSpeed} - ${record.MaxSpeed} km/h`
        },
        {
            title: t("section.lightSystem"),
            dataIndex: 'HasLighting',
            key: 'HasLighting',
            render: (hasLighting: boolean) => (
                <Tag color={hasLighting ? 'green' : 'red'}>
                    {hasLighting ? 'Có' : 'Không'}
                </Tag>
            )
        },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <MainLayout>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                        <Spin size="large" description="Đang tải dữ liệu tuyến đường..." />
                    </div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    if (error || !data) {
        return (
            <ProtectedRoute>
                <MainLayout>
                    <div style={{ padding: '20px' }}>
                        <Alert
                            message="Lỗi tải dữ liệu"
                            description={error || 'Không tìm thấy thông tin tuyến đường.'}
                            type="error"
                            showIcon
                        />
                    </div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    <FontAwesomeIcon icon={faCodeBranch} /> {t("expressway.interchange")} ({data.interchange?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.interchange || []} columns={interchangeColumns} rowKey="InterchangeId" pagination={false} size="small" locale={{ emptyText: 'Chưa có dữ liệu nút giao' }} scroll={{ x: 'max-content' }} />
        },
        {
            key: '2',
            label: (
                <span>
                    <FontAwesomeIcon icon={faGasPump} /> {t("expressway.restStop")} ({data.restStop?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.restStop || []} columns={restStopColumns} rowKey="RestStopId" pagination={false} size="small" locale={{ emptyText: 'Chưa có trạm dừng nghỉ' }} scroll={{ x: 'max-content' }} />
        },
        {
            key: '3',
            label: (
                <span>
                    <FontAwesomeIcon icon={faRoadBridge} /> {t("expressway.bridge")} ({data.bridge?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.bridge || []} columns={bridgeColumns} rowKey="BridgeId" pagination={false} size="small" locale={{ emptyText: 'Chưa có dữ liệu cầu' }} scroll={{ x: 'max-content' }} />
        },
        {
            key: '4',
            label: (
                <span>
                    <FontAwesomeIcon icon={faCarTunnel} /> {t("expressway.tunnel")} ({data.tunnel?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.tunnel || []} columns={tunnelColumns} rowKey="TunnelId" pagination={false} size="small" locale={{ emptyText: 'Tuyến đường không có hầm' }} scroll={{ x: 'max-content' }} />
        },
    ];

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '20px', position: 'relative' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                {data.Image && (
                                    <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={getImageUrl(data.Image)}
                                            alt="Đoạn đường"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                {data.SpeedSign && (
                                    <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={getImageUrl(data.SpeedSign)}
                                            alt="Biển báo tốc độ"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div className="map-wrapper-expressway" style={{ marginTop: '8px' }}>
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
                                                {t("home.fullScreen")}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={16} lg={18}>
                            <Flex vertical gap="large" style={{ width: '100%' }}>
                                <Card style={{ width: '100%', border: 'none', background: '#ffffff' }}>
                                    <Flex vertical gap="small" style={{ marginBottom: '20px' }}>
                                        <Space>
                                            <CompassOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <Title level={3} style={{ margin: 0 }}>
                                                {t("section.sectionDetail")}
                                            </Title>
                                        </Space>
                                    </Flex>

                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="middle"
                                        styles={{ label: { background: '#f5f5f5', fontWeight: 600, width: '15%' } }}
                                    >
                                        <Descriptions.Item label={t("expressway.name")}>
                                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>{data.NameSection}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label={t("expressway.province")}>
                                            <Space wrap>
                                                {data.province?.map((p) => (
                                                    <Tag color="volcano" key={p.ProvinceId}>{p.ProvinceName}</Tag>
                                                ))}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Tổng chiều dài">
                                            <Space>
                                                <Text strong>{data.Length}</Text>
                                                <Text type="secondary">Km</Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Tốc độ cho phép">
                                            <Space>
                                                <div className="whitespace-pre-line">
                                                    {data.SpeedLimit}
                                                </div>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Cột mốc tuyến đường">
                                            <Space separator={<Text type="secondary">→</Text>}>
                                                <Text>{data.StartLocation} <Text type="secondary">(Km {data.StartKm})</Text></Text>
                                                <Text>{data.EndLocation} <Text type="secondary">(Km {data.EndKm})</Text></Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Quy mô làn xe">
                                            <Flex vertical gap={0}>
                                                <Text>{data.TrafficLand} làn xe chính</Text>
                                                {data.HasEmergencyLand && (
                                                    <Text type="success" style={{ fontSize: '13px' }}>
                                                        <SafetyCertificateOutlined /> Có làn dừng khẩn cấp
                                                    </Text>
                                                )}
                                            </Flex>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Trạng thái vận hành">
                                            {getStatusBadge(data.Status)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                <Card style={{ width: '100%', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <Tabs
                                            defaultActiveKey="1"
                                            items={tabItems}
                                            moreIcon={null}
                                        />
                                    </div>
                                </Card>
                            </Flex>
                        </Col>
                    </Row>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};
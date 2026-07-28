'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col, Typography, Badge, Descriptions, Space, Tabs, Table, Tag, Spin, Alert } from 'antd';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import "./style.css";
import {
    CompassOutlined,
    SafetyCertificateOutlined,
    BranchesOutlined,
    CoffeeOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import MainLayout from '@/app/layout/Layout';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            Creating the map...
        </div>
    )
});

const { Title, Text } = Typography;

// --- Interfaces khớp 100% với JSON API ---
interface InterchangeItem {
    InterchangeId: number;
    SectionId: number;
    NameInterchange: string;
    Type: string;
    Location: string;
    Longitude: number | null;
    Latitude: number | null;
    BOT: string;
    Connection: string;
    Status: string;
}

interface RestStopItem {
    RestStopId: number;
    SectionId: number;
    NameRestStop: string;
    Location: string;
    Longitude: number | null;
    Latitude: number | null;
    HasPetrol: boolean;
    HasFood: boolean;
    HasToilet: boolean;
    Status: string;
}

interface BridgeItem {
    BridgeId?: number;
    NameBridge?: string;
    Location?: string;
    LengthMeter?: number;
}

interface TunnelItem {
    TunnelId?: number;
    NameTunnel?: string;
    Location?: string;
    LengthMeter?: number;
}

interface ProvinceItem {
    ProvinceId: number;
    ProvinceName: string;
    Region: string;
}

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
    SpeedSign: string | null;
    SpeedLimit: string | null;
    TrafficLand: number;
    HasEmergencyLand: boolean;
    Status: string;
    MapData: string;
    restStop?: RestStopItem[];
    interchange?: InterchangeItem[];
    bridge?: BridgeItem[];
    tunnel?: TunnelItem[];
    province?: ProvinceItem[];
}

export default function ExpresswayPage() {
    const params = useParams();
    const rawId = params?.id;
    const currentId = Array.isArray(rawId) ? rawId[0] : rawId;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [data, setData] = useState<SectionDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSectionDetail = async () => {
            if (!currentId) return;

            try {
                setLoading(true);
                setError(null);

                const apiUrl = `${baseUrl}/sections/${currentId}`;
                console.log("👉 [Public] URL API đang gọi:", apiUrl);

                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

                const result = await response.json();
                console.log("👉 [Public] Dữ liệu thô từ API:", result);
                const sectionData = result?.data || result;

                if (Array.isArray(sectionData)) {
                    const found = sectionData.find((item: any) => String(item.SectionId) === String(currentId));
                    setData(found || sectionData[0] || null);
                } else {
                    setData(sectionData);
                }

            } catch (err: any) {
                console.error("❌ Lỗi Fetch:", err);
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
                return <Badge status="success" text="Hoàn thành / Đang hoạt động" />;
            case 'Under construction':
                return <Badge status="processing" text="Đang thi công" />;
            case 'Extend under construction':
                return <Badge status="warning" text="Đang mở rộng" />;
            default:
                return <Badge status="default" text={status} />;
        }
    };

    // Helper ghép URL ảnh
    const getImageUrl = (path?: string | null) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    };

    // --- Cấu hình bảng Nút giao ---
    const interchangeColumns = [
        {
            title: 'Tên nút giao',
            dataIndex: 'NameInterchange',
            key: 'NameInterchange',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Vị trí',
            dataIndex: 'Location',
            key: 'Location',
            render: (km: string) => <Tag color="blue">Km {km}</Tag>
        },
        {
            title: 'Loại hình',
            dataIndex: 'Type',
            key: 'Type'
        },
        {
            title: 'Kết nối',
            dataIndex: 'Connection',
            key: 'Connection',
            render: (text: string) => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
        },
        {
            title: 'Trạm BOT',
            dataIndex: 'BOT',
            key: 'BOT',
            render: (bot: string) => (
                <Tag color={bot === 'Operating' ? 'green' : 'default'}>
                    {bot === 'Operating' ? 'Đang thu phí' : 'Không'}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'Status',
            key: 'Status',
            render: (status: string) => getStatusBadge(status)
        },
        {
            title: 'Tọa độ (Lat, Lng)',
            key: 'coordinates',
            render: (_: any, record: InterchangeItem) => (
                record.Latitude && record.Longitude ? (
                    <Tag icon={<EnvironmentOutlined />} color="cyan">
                        {record.Latitude.toFixed(4)}, {record.Longitude.toFixed(4)}
                    </Tag>
                ) : <Text type="secondary">Chưa cập nhật</Text>
            )
        },
    ];

    // --- Cấu hình bảng Trạm dừng nghỉ ---
    const restStopColumns = [
        {
            title: 'Tên trạm dừng',
            dataIndex: 'NameRestStop',
            key: 'NameRestStop',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Vị trí',
            dataIndex: 'Location',
            key: 'Location',
            render: (km: string) => <Tag color="green">Km {km}</Tag>
        },
        {
            title: 'Tiện ích dịch vụ',
            key: 'services',
            render: (_: any, record: RestStopItem) => (
                <Space wrap>
                    {record.HasPetrol && <Tag color="orange">⛽ Cây xăng</Tag>}
                    {record.HasFood && <Tag color="blue">🍽️ Ăn uống</Tag>}
                    {record.HasToilet && <Tag color="cyan">🚾 Vệ sinh</Tag>}
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'Status',
            key: 'Status',
            render: (status: string) => (
                <Tag color={status === 'Operating' ? 'success' : 'processing'}>
                    {status === 'Operating' ? 'Đang hoạt động' : status}
                </Tag>
            )
        },
        {
            title: 'Tọa độ (Lat, Lng)',
            key: 'coordinates',
            render: (_: any, record: RestStopItem) => (
                record.Latitude && record.Longitude ? (
                    <Tag icon={<EnvironmentOutlined />} color="purple">
                        {record.Latitude.toFixed(6)}, {record.Longitude.toFixed(6)}
                    </Tag>
                ) : <Text type="secondary">Chưa cập nhật</Text>
            )
        },
    ];

    const bridgeColumns = [
        { title: 'Tên cầu', dataIndex: 'NameBridge', key: 'NameBridge', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Vị trí', dataIndex: 'Location', key: 'Location', render: (km: string) => <Tag color="orange">Km {km}</Tag> },
    ];

    const tunnelColumns = [
        { title: 'Tên đường hầm', dataIndex: 'NameTunnel', key: 'NameTunnel', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Vị trí', dataIndex: 'Location', key: 'Location', render: (km: string) => <Tag color="purple">Km {km}</Tag> },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <MainLayout>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                        <Spin size="large" tip="Đang tải dữ liệu tuyến đường..." />
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
                    <BranchesOutlined /> Nút giao ({data.interchange?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.interchange || []} columns={interchangeColumns} rowKey="InterchangeId" pagination={false} size="small" locale={{ emptyText: 'Chưa có dữ liệu nút giao' }} />
        },
        {
            key: '2',
            label: (
                <span>
                    <CoffeeOutlined /> Trạm dừng nghỉ ({data.restStop?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.restStop || []} columns={restStopColumns} rowKey="RestStopId" pagination={false} size="small" locale={{ emptyText: 'Chưa có trạm dừng nghỉ' }} />
        },
        {
            key: '3',
            label: (
                <span>
                    <EnvironmentOutlined /> Cầu ({data.bridge?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.bridge || []} columns={bridgeColumns} rowKey="BridgeId" pagination={false} size="small" locale={{ emptyText: 'Chưa có dữ liệu cầu' }} />
        },
        {
            key: '4',
            label: (
                <span>
                    <CompassOutlined /> Đường hầm ({data.tunnel?.length || 0})
                </span>
            ),
            children: <Table dataSource={data.tunnel || []} columns={tunnelColumns} rowKey="TunnelId" pagination={false} size="small" locale={{ emptyText: 'Tuyến đường không có hầm' }} />
        },
    ];

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '20px', position: 'relative' }}>
                    <Row gutter={[24, 24]}>
                        {/* Cột trái: Hình ảnh & Bản đồ */}
                        <Col xs={24} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                {/* Ảnh tuyến đường */}
                                {data.Image && (
                                    <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={getImageUrl(data.Image)}
                                            alt="Đoạn đường"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                {/* Ảnh biển báo tốc độ (Lấy từ SpeedSign) */}
                                {data.SpeedSign && (
                                    <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={getImageUrl(data.SpeedSign)}
                                            alt="Biển báo tốc độ"
                                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                {/* Bản đồ */}
                                <div className="map-wrapper" style={{ marginTop: '8px' }}>
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
                                                Xem toàn màn hình
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Cột phải: Thông tin tổng quan & Bảng chi tiết */}
                        <Col xs={24} md={16} lg={18}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Card style={{ width: '100%', border: 'none', background: '#ffffff' }}>
                                    <Space direction="vertical" size="small" style={{ marginBottom: '20px' }}>
                                        <Space>
                                            <CompassOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <Title level={3} style={{ margin: 0 }}>
                                                CHI TIẾT ĐOẠN ĐƯỜNG CAO TỐC
                                            </Title>
                                        </Space>
                                    </Space>

                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="middle"
                                        labelStyle={{ background: '#f5f5f5', fontWeight: 600, width: '15%' }}
                                    >
                                        <Descriptions.Item label="Tên đoạn đường">
                                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>{data.NameSection}</Text>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Tỉnh / Thành phố">
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
                                            <Space split={<Text type="secondary">→</Text>}>
                                                <Text>{data.StartLocation} <Text type="secondary">(Km {data.StartKm})</Text></Text>
                                                <Text>{data.EndLocation} <Text type="secondary">(Km {data.EndKm})</Text></Text>
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Quy mô làn xe">
                                            <Space direction="vertical" size={0}>
                                                <Text>{data.TrafficLand} làn xe chính</Text>
                                                {data.HasEmergencyLand && (
                                                    <Text type="success" style={{ fontSize: '13px' }}>
                                                        <SafetyCertificateOutlined /> Có làn dừng khẩn cấp
                                                    </Text>
                                                )}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Trạng thái vận hành">
                                            {getStatusBadge(data.Status)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {/* Bảng thông tin chi tiết */}
                                <Card style={{ width: '100%' }}>
                                    <Tabs defaultActiveKey="1" items={tabItems} />
                                </Card>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};
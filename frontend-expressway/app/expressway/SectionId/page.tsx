'use client';

import dynamic from 'next/dynamic';
import { Card, Row, Col, Typography, Badge, Descriptions, Space, Tabs, Table, Tag } from 'antd';
import { useState } from 'react';
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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const DynamicMapContainer = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            Creating the map...
        </div>
    )
});

const { Title, Text } = Typography;

// 1. Interface chuẩn khớp 100% với JSON API
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
    SpeedLimit: string; // Trong JSON trường này lưu link ảnh biển báo
    TrafficLand: number;
    HasEmergencyLand: boolean;
    Status: string;
    MapData: string;
    interchange: InterchangeItem[];
    restStop: RestStopItem[];
    bridge: BridgeItem[];
    tunnel: TunnelItem[];
    province: ProvinceItem[];
}

const ExpresswayPage = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 2. Mock Data từ đúng JSON bạn cung cấp
    const data: SectionDetail = {
        SectionId: 101,
        ExpresswayId: 100,
        NameSection: "Pháp Vân – Cầu Giẽ",
        Image: "uploads/ways/phapvancaugie.jpg",
        Length: 30,
        StartLocation: "Pháp Vân",
        StartKm: 182,
        EndLocation: "Đại Xuyên",
        EndKm: 211.7,
        SpeedLimit: "uploads/signs/phapvancaugietocdo.png",
        TrafficLand: 6,
        HasEmergencyLand: true,
        Status: "Complete",
        MapData: "uploads/maps/phapvancaugie.json",
        restStop: [],
        interchange: [
            {
                InterchangeId: 10101,
                SectionId: 101,
                NameInterchange: "Pháp Vân",
                Type: "Trumpet",
                Location: "182",
                Longitude: 105.849085,
                Latitude: 20.961243,
                BOT: "Nop",
                Connection: "Hanoi Ring Road 3, AH1",
                Status: "Complete"
            },
            {
                InterchangeId: 10102,
                SectionId: 101,
                NameInterchange: "Tứ Hiệp",
                Type: "Diamond",
                Location: "184.7",
                Longitude: null,
                Latitude: null,
                BOT: "Nop",
                Connection: "Tam Trinh – Văn Điển Road",
                Status: "Under construction"
            },
            {
                InterchangeId: 10103,
                SectionId: 101,
                NameInterchange: "Hanoi Ring Road 4",
                Type: "Diamond",
                Location: "190",
                Longitude: 105.868271,
                Latitude: 20.891335,
                BOT: "Nop",
                Connection: "Hanoi Ring Road 4",
                Status: "Under construction"
            },
            {
                InterchangeId: 10104,
                SectionId: 101,
                NameInterchange: "Thường Tín",
                Type: "Diamond",
                Location: "192.7",
                Longitude: 105.879758,
                Latitude: 20.870341,
                BOT: "Operating",
                Connection: "DT427",
                Status: "Complete"
            },
            {
                InterchangeId: 10105,
                SectionId: 101,
                NameInterchange: "Vạn Điểm",
                Type: "Diamond",
                Location: "203.7",
                Longitude: 105.908351,
                Latitude: 20.77252,
                BOT: "Operating",
                Connection: "DT429",
                Status: "Complete"
            },
            {
                InterchangeId: 10106,
                SectionId: 101,
                NameInterchange: "Đại Xuyên",
                Type: "Trumpet",
                Location: "211.7",
                Longitude: 105.91885,
                Latitude: 20.703974,
                BOT: "Operating",
                Connection: "AH1, \r\nDT428",
                Status: "Complete"
            }
        ],
        bridge: [],
        tunnel: [],
        province: [
            {
                ProvinceId: 1,
                ProvinceName: "Hà Nội City",
                Region: "North"
            }
        ]
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Complete':
                return <Badge status="success" text="Active / Complete" />;
            case 'Under construction':
                return <Badge status="processing" text="Under Construction" />;
            case 'Extend under construction':
                return <Badge status="warning" text="Extending" />;
            default:
                return <Badge status="default" text={status} />;
        }
    };

    // 3. Cột cho bảng Nút giao (Interchange)
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
            render: (text: string) => <span>{text}</span>
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

    // Cột Trạm dừng
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

    // Cột Cầu
    const bridgeColumns = [
        { title: 'Tên cầu', dataIndex: 'NameBridge', key: 'NameBridge', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Vị trí', dataIndex: 'Location', key: 'Location', render: (km: string) => <Tag color="orange">Km {km}</Tag> },
    ];

    // Cột Đường hầm
    const tunnelColumns = [
        { title: 'Tên đường hầm', dataIndex: 'NameTunnel', key: 'NameTunnel', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Vị trí', dataIndex: 'Location', key: 'Location', render: (km: string) => <Tag color="purple">Km {km}</Tag> },
    ];

    // 4. Các Tab
    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    <BranchesOutlined /> Nút giao ({data.interchange.length})
                </span>
            ),
            children: <Table dataSource={data.interchange} columns={interchangeColumns} rowKey="InterchangeId" pagination={false} size="small" />
        },
        {
            key: '2',
            label: (
                <span>
                    <CoffeeOutlined /> Trạm dừng nghỉ ({data.restStop.length})
                </span>
            ),
            children: (
                <Table
                    dataSource={data.restStop}
                    columns={restStopColumns}
                    rowKey="RestStopId"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'Chưa có trạm dừng nghỉ' }}
                />
            )
        },
        {
            key: '3',
            label: (
                <span>
                    <EnvironmentOutlined /> Cầu ({data.bridge.length})
                </span>
            ),
            children: <Table dataSource={data.bridge} columns={bridgeColumns} rowKey="BridgeId" pagination={false} size="small" locale={{ emptyText: 'Chưa có dữ liệu cầu' }} />
        },
        {
            key: '4',
            label: (
                <span>
                    <CompassOutlined /> Đường hầm ({data.tunnel.length})
                </span>
            ),
            children: <Table dataSource={data.tunnel} columns={tunnelColumns} rowKey="TunnelId" pagination={false} size="small" locale={{ emptyText: 'Tuyến đường không có hầm' }} />
        },
    ];

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '20px', position: 'relative' }}>
                    <Row gutter={[24, 24]}>
                        {/* Cột trái: Ảnh đoạn đường, Ảnh biển báo & Bản đồ */}
                        <Col xs={24} md={8} lg={6}>
                            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                {/* Ảnh đoạn đường */}
                                <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img
                                        src={`${baseUrl}/${data.Image}`}
                                        alt="Đoạn đường"
                                        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Ảnh Biển báo tốc độ (lấy từ SpeedLimit) */}
                                <div style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img
                                        src={`${baseUrl}/${data.SpeedLimit}`}
                                        alt="Biển báo tốc độ"
                                        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Map */}
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
                                                Full screen
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Cột phải: Thông tin tổng quan & Bảng danh sách */}
                        <Col xs={24} md={16} lg={18}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Card style={{ width: '100%', border: 'none', background: '#ffffff' }}>
                                    <Space direction="vertical" size="small" style={{ marginBottom: '20px' }}>
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

                                        <Descriptions.Item label="Provinces">
                                            <Space wrap>
                                                {data.province?.map((p) => (
                                                    <Tag color="volcano" key={p.ProvinceId}>{p.ProvinceName}</Tag>
                                                ))}
                                            </Space>
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
                                </Card>

                                {/* Tabs dữ liệu chi tiết Nút giao, Trạm dừng, Cầu, Hầm */}
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

export default ExpresswayPage;
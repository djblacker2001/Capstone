'use client';

import { Card, Row, Col, Typography, Space, Button, message, Spin, Tag, Empty, Input, Select, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { CompassOutlined, InfoCircleOutlined, EnvironmentOutlined, CarOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
interface RestStop {
    RestStopId: number;
    NameRestStop: string;
    Status?: string;
}

interface Interchange {
    InterchangeId: number;
    NameInterchange: string;
}

interface Section {
    SectionId: number;
    NameSection: string;
    Image?: string;
    Length: number;
    StartLocation: string;
    StartKm?: number;
    EndLocation: string;
    EndKm?: number;
    Status?: string;
    restStops?: RestStop[];
    restStop?: RestStop[];
    interchange?: Interchange[];
    interchangeCount?: number;
    restStopCount?: number;
}

export default function ExpresswayPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterName, setFilterName] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [filterProvince, setFilterProvince] = useState<string>('');
    const [filterKm, setFilterKm] = useState<string>('');

    const fetchAllSections = async () => {
        setLoading(true);
        try {
            const [sectionsRes, statsRes] = await Promise.all([
                axios.get(`${baseUrl}/sections`),
                axios.get(`${baseUrl}/sections/statistics`).catch(err => {
                    console.error("Lỗi lấy dữ liệu API thống kê:", err);
                    return { data: [] };
                })
            ]);

            handleSetData(sectionsRes.data, statsRes.data);
        } catch (err) {
            console.error('Lỗi lấy danh sách đoạn đường:', err);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSections();
    }, []);

    const handleSetData = (rawData: any, statsData?: any[]) => {
        console.log("Dữ liệu gốc từ API gửi về:", rawData);

        let extractedArray: any[] = [];
        if (!rawData) {
            setSections([]);
            return;
        }

        if (rawData.data && rawData.data.data) {
            if (Array.isArray(rawData.data.data)) {
                extractedArray = rawData.data.data;
            } else if (typeof rawData.data.data === 'object' && rawData.data.data !== null) {
                extractedArray = [rawData.data.data];
            }
        } else if (rawData.data && Array.isArray(rawData.data)) {
            extractedArray = rawData.data;
        } else if (Array.isArray(rawData)) {
            extractedArray = rawData;
        } else if (rawData.result && Array.isArray(rawData.result)) {
            extractedArray = rawData.result;
        }

        const normalizedArray = extractedArray.map((item: any) => {
            const sectionId = item.SectionId ?? item.sectionId ?? item.id;
            const sectionStats = Array.isArray(statsData)
                ? statsData.find((stat: any) => String(stat.id) === String(sectionId))
                : null;

            return {
                SectionId: Number(sectionId),
                NameSection: item.NameSection ?? item.Namesection ?? item.nameSection ?? item.name ?? 'Không có tên',
                Image: item.Image ?? item.image,
                Length: item.Length ?? item.length ?? 0,
                StartLocation: item.StartLocation ?? item.startLocation ?? 'Chưa xác định',
                StartKm: item.StartKm ?? item.startKm,
                EndLocation: item.EndLocation ?? item.endLocation ?? 'Chưa xác định',
                EndKm: item.EndKm ?? item.endKm,
                Status: item.Status ?? item.status,
                restStops: item.restStops ?? item.restStop ?? item.RestStops ?? [],
                interchange: item.interchange ?? item.interchanges ?? item.Interchange ?? [],
                interchangeCount: sectionStats?.interchangeCount !== undefined ? Number(sectionStats.interchangeCount) : undefined,
                restStopCount: sectionStats?.restStopCount !== undefined ? Number(sectionStats.restStopCount) : undefined
            };
        });

        console.log("Dữ liệu sau khi chuẩn hóa:", normalizedArray);
        setSections(normalizedArray);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const headers = { 'accept-language': 'vi' };
            const statsRes = await axios.get(`${baseUrl}/sections/statistics`).catch(() => ({ data: [] }));

            if (filterKm.trim() !== '') {
                const res = await axios.get(`${baseUrl}/sections/kilometre`, {
                    params: { km: filterKm.trim() },
                    headers,
                });
                handleSetData(res.data, statsRes.data);
                message.success(`Đã tìm thấy các phân đoạn đi qua Km ${filterKm}`);
            }

            else if (filterName.trim() || filterStatus || filterProvince.trim()) {
                const params: any = {};
                if (filterName.trim()) params.name = filterName.trim();
                if (filterStatus) params.status = filterStatus;
                if (filterProvince.trim()) params.provinceName = filterProvince.trim();

                const res = await axios.get(`${baseUrl}/sections/search`, {
                    params,
                    headers,
                });
                handleSetData(res.data, statsRes.data);
            }

            else {
                await fetchAllSections();
            }
        } catch (err) {
            console.error('Lỗi tìm kiếm:', err);
            setSections([]);
            message.error('Không tìm thấy kết quả phù hợp');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilterName('');
        setFilterStatus(undefined);
        setFilterProvince('');
        setFilterKm('');
        fetchAllSections();
    };

    const getSectionStatusProps = (status: string | undefined) => {
        switch (status) {
            case 'Complete':
            case 'Operating':
            case 'Đang hoạt động':
                return { text: 'Đang hoạt động', color: 'green' };

            case 'Under construction':
            case 'Đang thi công':
                return { text: 'Đang thi công', color: 'orange' };

            case 'Extend under construction':
            case 'Đang thi công mở rộng':
                return { text: 'Đang thi công mở rộng', color: 'purple' };

            case 'Accident':
            case 'Incident':
            case 'Đang gặp sự cố':
                return { text: 'Đang gặp sự cố', color: 'red' };

            case 'Maintenance':
            case 'Đang bảo trì':
                return { text: 'Đang bảo trì', color: 'blue' };

            default:
                return { text: status || 'Chưa xác định', color: 'default' };
        }
    };

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: '#f8f9fa' }}>
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
                            🗺️ Danh Sách Phân Đoạn Cao Tốc
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            Hệ thống tra cứu thông tin chi tiết các phân đoạn cao tốc Việt Nam
                        </Text>
                    </div>

                    <Card style={{ marginBottom: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <Row gutter={[16, 16]} align="bottom">
                            <Col xs={24} sm={12} md={6}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>Tên đoạn đường:</div>
                                <Input
                                    placeholder="Nhập tên đoạn đường..."
                                    value={filterName}
                                    disabled={!!filterKm}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} sm={12} md={5}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>Trạng thái:</div>
                                <Select
                                    placeholder="Chọn trạng thái..."
                                    style={{ width: '100%' }}
                                    value={filterStatus}
                                    disabled={!!filterKm}
                                    onChange={(value) => setFilterStatus(value)}
                                    allowClear
                                >
                                    <Option value="Complete">Đang hoạt động</Option>
                                    <Option value="Under construction">Đang thi công</Option>
                                    <Option value="Extend under construction">Đang thi công mở rộng</Option>
                                    <Option value="Incident">Đang gặp sự cố</Option>
                                    <Option value="Maintenance">Đang bảo trì</Option>
                                </Select>
                            </Col>

                            <Col xs={24} sm={12} md={5}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>Đi qua tỉnh/thành:</div>
                                <Input
                                    placeholder="Ví dụ: Hà Nội, Ninh Bình..."
                                    value={filterProvince}
                                    disabled={!!filterKm}
                                    onChange={(e) => setFilterProvince(e.target.value)}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} sm={12} md={4}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Tìm theo số Km:
                                    <Tooltip title="Nhập số Km để tra cứu những tuyến đường bao trùm hoặc đi qua tọa độ Km này">
                                        <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                                    </Tooltip>
                                </div>
                                <Input
                                    type="number"
                                    placeholder="Nhập số km (VD: 250)..."
                                    value={filterKm}
                                    disabled={!!(filterName || filterStatus || filterProvince)}
                                    onChange={(e) => setFilterKm(e.target.value)}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} md={4}>
                                <Space style={{ width: '100%' }}>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleSearch}
                                        style={{ background: '#004f9f', borderColor: '#004f9f' }}
                                    >
                                        Tìm kiếm
                                    </Button>
                                    <Button icon={<UndoOutlined />} onClick={handleReset}>
                                        Reset
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Spin size="large" tip="Đang truy xuất dữ liệu..." />
                        </div>
                    ) : sections.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {sections.map((section) => {
                                const fullImageUrl = section.Image && section.Image.startsWith('http')
                                    ? section.Image
                                    : `${baseUrl}/${section.Image}`;

                                const displayInterchanges = section.interchangeCount !== undefined
                                    ? section.interchangeCount
                                    : (section.interchange?.length || 0);

                                const displayRestStops = section.restStopCount !== undefined
                                    ? section.restStopCount
                                    : (section.restStops?.length || section.restStop?.length || 0);

                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={section.SectionId}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                                                border: '1px solid #eef0f2'
                                            }}
                                            bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
                                            cover={
                                                <div style={{
                                                    height: '100%',
                                                    width: '100%',
                                                    background: '#004f9f',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img
                                                        alt={section.NameSection}
                                                        src={section.Image ? fullImageUrl : 'https://placehold.co/400x200?text=L%E1%BB%90I+V%C3%80O'}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                    {!section.Image && (
                                                        <div style={{
                                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                                            color: '#fff', borderBottom: '6px solid #fff'
                                                        }}>
                                                            <span style={{ fontSize: '12px', letterSpacing: '2px', border: '1px solid #fff', padding: '2px 6px', marginBottom: '8px', borderRadius: '4px' }}>
                                                                CT.01
                                                            </span>
                                                            <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>LỐI VÀO</span>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                                                <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a3353', flex: 1 }}>
                                                    Đường cao tốc {section.NameSection}
                                                </Title>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <Tag color="blue" style={{ fontSize: '13px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                    Chiều dài: {section.Length} km
                                                </Tag>
                                            </div>

                                            <Space direction="vertical" size={6} style={{ width: '100%', marginBottom: '16px', fontSize: '13px' }}>
                                                <div>
                                                    <EnvironmentOutlined style={{ color: '#52c41a', marginRight: '6px' }} />
                                                    <Text type="secondary">Đầu: </Text>
                                                    <Text strong>Nút giao {section.StartLocation}</Text>
                                                    {section.StartKm !== undefined && <Text type="secondary"> (Km {section.StartKm})</Text>}
                                                </div>
                                                <div>
                                                    <EnvironmentOutlined style={{ color: '#f5222d', marginRight: '6px' }} />
                                                    <Text type="secondary">Cuối: </Text>
                                                    <Text strong>Nút giao {section.EndLocation}</Text>
                                                    {section.EndKm !== undefined && <Text type="secondary"> (Km {section.EndKm})</Text>}
                                                </div>
                                                <div>
                                                    <CompassOutlined style={{ color: '#1890ff', marginRight: '6px' }} />
                                                    <Text type="secondary">Số nút giao: </Text>
                                                    <Text strong>{displayInterchanges}</Text>
                                                </div>
                                                <div>
                                                    <CarOutlined style={{ color: '#595959', marginRight: '6px' }} />
                                                    <Text type="secondary">Trạm dừng nghỉ: </Text>
                                                    <Text strong>{displayRestStops}</Text>
                                                </div>
                                                <Tag
                                                    color={getSectionStatusProps(section.Status).color}
                                                    style={{ marginRight: 0, borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}
                                                >
                                                    {getSectionStatusProps(section.Status).text}
                                                </Tag>
                                            </Space>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <Empty description="Không tìm thấy phân đoạn cao tốc nào." style={{ marginTop: '60px' }} />
                    )}
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
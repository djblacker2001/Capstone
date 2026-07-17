'use client';

import { Card, Row, Col, Typography, Badge, Descriptions, Space, Button, message, Spin, Tag, Empty, Input, Select, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { CompassOutlined, DashboardOutlined, SafetyCertificateOutlined, InfoCircleOutlined, EnvironmentOutlined, CarOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
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
    restStop?: RestStop[];
    interchange?: Interchange[];
}

const ExpresswayPage = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterName, setFilterName] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [filterProvince, setFilterProvince] = useState<string>('');
    const [filterKm, setFilterKm] = useState<string>('');

    const fetchAllSections = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/sections`);
            handleSetData(res.data);
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

    const handleSetData = (rawData: any) => {
        console.log("Dữ liệu gốc từ API gửi về:", rawData);

<<<<<<< Updated upstream
        let extractedArray: any[] = [];

        // 1. Trích xuất mảng từ các lớp bọc của API
        if (!rawData) {
            setSections([]);
            return;
        }
        if (Array.isArray(rawData)) {
            extractedArray = rawData;
        } else if (rawData.data && rawData.data.data && Array.isArray(rawData.data.data)) {
            extractedArray = rawData.data.data;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            extractedArray = rawData.data;
        } else if (rawData.result && Array.isArray(rawData.result)) {
            extractedArray = rawData.result;
        } else if (typeof rawData === 'object' && rawData !== null && (rawData.SectionId || rawData.id)) {
            extractedArray = [rawData];
        }

        // 2. 🎯 CHUẨN HÓA DỮ LIỆU (Đồng bộ chữ HOA / chữ thường của các Key)
        const normalizedArray = extractedArray.map((item: any) => {
            return {
                SectionId: item.SectionId ?? item.sectionId ?? item.id,
                NameSection: item.NameSection ?? item.Namesection ?? item.nameSection ?? item.name ?? 'Không có tên',
                Image: item.Image ?? item.image,
                Length: item.Length ?? item.length ?? 0,
                StartLocation: item.StartLocation ?? item.startLocation ?? 'Chưa xác định',
                StartKm: item.StartKm ?? item.startKm,
                EndLocation: item.EndLocation ?? item.endLocation ?? 'Chưa xác định',
                EndKm: item.EndKm ?? item.endKm,
                Status: item.Status ?? item.status,
                restStops: item.restStops ?? item.restStop ?? item.RestStops ?? [],
                interchange: item.interchange ?? item.interchanges ?? item.Interchange ?? []
            };
        });

        console.log("Dữ liệu sau khi đã chuẩn hóa chuẩn chỉ:", normalizedArray);
        setSections(normalizedArray);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const headers = { 'accept-language': 'vi' };
            if (filterKm.trim() !== '') {
                const res = await axios.get(`${baseUrl}/sections/kilometre`, {
                    params: { km: filterKm.trim() },
                    headers,
                });
                handleSetData(res.data);
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
                handleSetData(res.data);
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
=======
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
>>>>>>> Stashed changes

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1500px', margin: '0 auto', minHeight: '100vh', background: '#f8f9fa' }}>
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <Title level={2} style={{ fontWeight: 700, margin: 0 }}>
                            🗺️ Danh Sách Phân Đoạn Cao Tốc
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            Hệ thống tra cứu thông tin chi tiết các phân đoạn cao tốc Việt Nam
                        </Text>
                    </div>

                    {/* 🎯 PANEL TÌM KIẾM 4 SELECT / INPUT CHUYÊN NGHIỆP */}
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

                            {/* 2. Lọc theo 5 trạng thái */}
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
<<<<<<< Updated upstream
                                    <Option value="Complete">Đang hoạt động</Option>
                                    <Option value="Under construction">Đang thi công</Option>
                                    <Option value="Extend under construction">Đang thi công mở rộng</Option>
                                    <Option value="Incident">Đang gặp sự cố</Option>
                                    <Option value="Maintenance">Đang bảo trì</Option>
                                </Select>
                            </Col>

                            {/* 3. Tìm theo Tỉnh thành */}
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

                            {/* 4. Tìm theo định vị Số Km */}
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
=======
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f1f1f' }}>
                                        {section.NameSection}
                                    </h3>

                                    <div style={{ marginBottom: '12px' }}>
                                        <Tag color="green">Chiều dài: {section.Length} km</Tag>
                                    </div>

                                    <div style={{ color: '#595959', fontSize: '13px', marginBottom: '12px' }}>
                                        <p style={{ margin: '4px 0' }}>
                                            <EnvironmentOutlined style={{ color: '#52c41a' }} /> <strong>Đầu:</strong> {section.StartLocation} (Km {section.StartKm})
                                        </p>
                                        <p style={{ margin: '4px 0' }}>
                                            <EnvironmentOutlined style={{ color: '#f5222d' }} /> <strong>Cuối:</strong> {section.EndLocation} (Km {section.EndKm})
                                        </p>
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '12px 0' }} />

                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '16px' }}>
                                        <div>🔘 Số nút giao: <strong>{section.interchange?.length || 0}</strong></div>
                                        <div>🏪 Trạm dừng nghỉ: <strong>{section.restStop ? 'Có trạm dừng' : 'Chưa có'}</strong></div>
                                    </div>
                                </Card>
>>>>>>> Stashed changes
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
                                    : `http://localhost:8080/${section.Image}`;

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
                                                    height: '160px',
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
                                                    <Text strong>{section.interchange?.length || 0}</Text>
                                                </div>
                                                <div>
                                                    <CarOutlined style={{ color: '#595959', marginRight: '6px' }} />
                                                    <Text type="secondary">Trạm dừng nghỉ: </Text>
                                                    <Text strong>{section.restStop?.length || 0}</Text>
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
};

export default ExpresswayPage;
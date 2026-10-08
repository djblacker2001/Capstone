'use client';

import { Card, Row, Col, Typography, Space, Button, message, Spin, Tag, Empty, Input, Select, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import MainLayout from '../layout/Layout';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { CompassOutlined, InfoCircleOutlined, EnvironmentOutlined, CarOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { Option } = Select;
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ExpresswayPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterName, setFilterName] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [filterProvince, setFilterProvince] = useState<string>('');
    const [filterKm, setFilterKm] = useState<string>('');
    const router = useRouter();
    const { t } = useTranslation();

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
            case 'Not yet construction':
                return { color: '#faad14', text: t("expressway.notYetConstruction") };
            case 'Complete':
                return { color: '#237804', text: t("expressway.complete") };
            case 'Under construction':
                return { color: '#1890ff', text: t("expressway.underConstruction") };
            case 'Extend under construction':
                return { color: '#86c5ff', text: t("expressway.extendUnderConstruction") };
            case 'Incident':
                return { color: '#ff4d4f', text: t("expressway.incident") };
            case 'Maintenance':
                return { color: '#722ed1', text: t("expressway.maintenance") };

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
                            {t("expressway.title")}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            {t("expressway.text")}
                        </Text>
                    </div>

                    <Card style={{ marginBottom: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <Row gutter={[16, 16]} align="bottom">
                            <Col xs={24} sm={12} md={6}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>{t("expressway.name")}:</div>
                                <Input
                                    placeholder={t("expressway.name")}
                                    value={filterName}
                                    disabled={!!filterKm}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    onPressEnter={handleSearch}
                                    allowClear
                                />
                            </Col>

                            <Col xs={24} sm={12} md={5}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>{t("expressway.status")}:</div>
                                <Select
                                    placeholder={t("expressway.status")}
                                    style={{ width: '100%' }}
                                    value={filterStatus}
                                    disabled={!!filterKm}
                                    onChange={(value) => setFilterStatus(value)}
                                    allowClear
                                >
                                    <Option value="Not yet construction">{t("expressway.notYetConstruction")}</Option>
                                    <Option value="Complete">{t("expressway.complete")}</Option>
                                    <Option value="Under construction">{t("expressway.underConstruction")}</Option>
                                    <Option value="Extend under construction">{t("expressway.extendUnderConstruction")}</Option>
                                    <Option value="Incident">{t("expressway.incident")}</Option>
                                    <Option value="Maintenance">{t("expressway.maintenance")}</Option>
                                </Select>
                            </Col>

                            <Col xs={24} sm={12} md={5}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343' }}>{t("expressway.province")}:</div>
                                <Select
                                    showSearch
                                    placeholder={t("expressway.province")}
                                    style={{ width: '100%' }}
                                    value={filterProvince || undefined}
                                    disabled={!!filterKm}
                                    onChange={(value) => setFilterProvince(value)}
                                    allowClear
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        { value: "Hà Nội City", label: "Hà Nội" },
                                        { value: "Cao Bằng Province", label: "Cao Bằng" },
                                        { value: "Tuyên Quang Province", label: "Tuyên Quang" },
                                        { value: "Điện Biên Province", label: "Điện Biên" },
                                        { value: "Lai Châu Province", label: "Lai Châu" },
                                        { value: "Sơn La Province", label: "Sơn La" },
                                        { value: "Lào Cai Province", label: "Lào Cai" },
                                        { value: "Thái Nguyên Province", label: "Thái Nguyên" },
                                        { value: "Lạng Sơn Province", label: "Lạng Sơn" },
                                        { value: "Quảng Ninh Province", label: "Quảng Ninh" },
                                        { value: "Bắc Ninh Province", label: "Bắc Ninh" },
                                        { value: "Phú Thọ Province", label: "Phú Thọ" },
                                        { value: "Hải Phòng City", label: "Hải Phòng" },
                                        { value: "Hưng Yên Province", label: "Hưng Yên" },
                                        { value: "Ninh Bình Province", label: "Ninh Bình" },
                                        { value: "Thanh Hóa Province", label: "Thanh Hóa" },
                                        { value: "Nghệ An Province", label: "Nghệ An" },
                                        { value: "Hà Tĩnh Province", label: "Hà Tĩnh" },
                                        { value: "Quảng Trị Province", label: "Quảng Trị" },
                                        { value: "Huế City", label: "Huế" },
                                        { value: "Đà Nẵng City", label: "Đà Nẵng" },
                                        { value: "Quảng Ngãi Province", label: "Quảng Ngãi" },
                                        { value: "Gia Lai Province", label: "Gia Lai" },
                                        { value: "Khánh Hòa Province", label: "Khánh Hòa" },
                                        { value: "Đắk Lắk Province", label: "Đắk Lắk" },
                                        { value: "Lâm Đồng Province", label: "Lâm Đồng" },
                                        { value: "Đồng Nai City", label: "Đồng Nai" },
                                        { value: "Hồ Chí Minh City", label: "Hồ Chí Minh" },
                                        { value: "Tây Ninh Province", label: "Tây Ninh" },
                                        { value: "Đồng Tháp Province", label: "Đồng Tháp" },
                                        { value: "Vĩnh Long Province", label: "Vĩnh Long" },
                                        { value: "An Giang Province", label: "An Giang" },
                                        { value: "Cần Thơ City", label: "Cần Thơ" },
                                        { value: "Cà Mau Province", label: "Cà Mau" },
                                    ]}
                                />
                            </Col>

                            <Col xs={24} sm={12} md={4}>
                                <div style={{ marginBottom: '6px', fontWeight: 600, color: '#434343', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {t("expressway.kilometer")}
                                    <Tooltip title={t("expressway.kilometerInformation")}>
                                        <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                                    </Tooltip>
                                </div>
                                <Input
                                    type="number"
                                    placeholder={t("expressway.kilometer")}
                                    value={filterKm}
                                    disabled={!!(filterName || filterStatus || filterProvince)}
                                    onChange={(e) => setFilterKm(e.target.value)}
                                    onPressEnter={handleSearch}

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
                                        {t("expressway.search")}
                                    </Button>
                                    <Button icon={<UndoOutlined />} onClick={handleReset}>
                                        {t("expressway.reset")}
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Spin size="large" description="Đang truy xuất dữ liệu..." />
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
                                            onClick={() => router.push(`/expressway/${section.SectionId}`)}
                                            style={{
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                border: '1px solid #eef0f2'
                                            }}
                                            styles={{
                                                body: {
                                                    padding: '20px',
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }
                                            }}
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
                                                        src={section.Image ? fullImageUrl : 'https://www.landuse-ca.org/wp-content/uploads/2019/04/no-photo-available.png'}
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
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                                                <Title level={5} style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a3353', flex: 1 }}>
                                                    {t("expressway.expressway")} {section.NameSection}
                                                </Title>
                                            </div>

                                            <div style={{ marginBottom: '16px' }}>
                                                <Tag color="blue" style={{ fontSize: '13px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                    {t("expressway.length")}: {section.Length} km
                                                </Tag>
                                            </div>

                                            <Space orientation="vertical" size={6} style={{ width: '100%', marginBottom: '16px', fontSize: '13px' }}>
                                                <div>
                                                    <EnvironmentOutlined style={{ color: '#52c41a', marginRight: '6px' }} />
                                                    <Text type="secondary">{t("expressway.start")}: </Text>
                                                    <Text strong>{t("expressway.interchange")} {section.StartLocation}</Text>
                                                    {section.StartKm !== undefined && <Text type="secondary"> (Km {section.StartKm})</Text>}
                                                </div>
                                                <div>
                                                    <EnvironmentOutlined style={{ color: '#f5222d', marginRight: '6px' }} />
                                                    <Text type="secondary">{t("expressway.end")}: </Text>
                                                    <Text strong>{t("expressway.interchange")} {section.EndLocation}</Text>
                                                    {section.EndKm !== undefined && <Text type="secondary"> (Km {section.EndKm})</Text>}
                                                </div>
                                                <div>
                                                    <CompassOutlined style={{ color: '#1890ff', marginRight: '6px' }} />
                                                    <Text type="secondary">{t("expressway.interchange")}: </Text>
                                                    <Text strong>{displayInterchanges}</Text>
                                                </div>
                                                <div>
                                                    <CarOutlined style={{ color: '#595959', marginRight: '6px' }} />
                                                    <Text type="secondary">{t("expressway.restStop")}: </Text>
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
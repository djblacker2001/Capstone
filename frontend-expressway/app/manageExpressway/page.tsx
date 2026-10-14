'use client';

import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tabs, Tag, message } from "antd";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";
import Link from "next/link";
import "./manageExpressway.css"
import { useRouter } from "next/navigation";
import ManageHeroImagesModal from "./ManageHeroImagesModal";
import { EditScoreModal } from "./EditScoreModal";
import { UpdateExpresswayModal } from "./UpdateExpresswayModal";

export default function ManageExpresswayPage() {
    const [data, setData] = useState<SectionType[]>([]);
    const [stats, setStats] = useState<ExpresswayStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<SectionType | null>(null);
    const [form] = Form.useForm();
    const router = useRouter();
    const [score, setScore] = useState<number>(482);
    const [selectedExpresswayId, setSelectedExpresswayId] = useState<number>(100);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedExpressway, setSelectedExpressway] = useState<any>(null);
    const [expresswayDetail, setExpresswayDetail] = useState<any>(null);

    useEffect(() => {
        const savedScore = localStorage.getItem('app_safety_score');
        if (savedScore !== null) {
            setScore(Number(savedScore));
        }
    }, []);

    const handleUpdateScore = (newScore: number) => {
        setScore(newScore);
        localStorage.setItem('app_safety_score', newScore.toString());
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, expresswayDetailRes]: [any, any] = await Promise.all([
                axiosClient.get('/expressways/statistics'),
                axiosClient.get(`/expressways/${selectedExpresswayId}`)
            ]);

            const expData = expresswayDetailRes?.data?.data || expresswayDetailRes?.data || expresswayDetailRes;
            setExpresswayDetail(expData);

            const statsData = statsRes?.data?.data || statsRes?.data || statsRes;
            setStats(statsData);
            const expresswayData = expresswayDetailRes?.data?.data || expresswayDetailRes?.data || expresswayDetailRes;
            const rawSections = expresswayData?.section || expresswayData?.sections || [];

            if (Array.isArray(rawSections)) {
                const formattedSections = rawSections.map((item: any) => ({
                    ...item,
                    expresswayName: expresswayData?.NameExpressway || 'Chưa xác định',
                    bridgeCount: item?.bridge?.length || 0,
                    tunnelCount: item?.tunnel?.length || 0,
                    interchangeCount: item?.interchange?.length || 0,
                    restStopCount: item?.restStop?.length || 0,
                    totalSectionLength: item?.Length || 0,
                }));

                setData(formattedSections);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            message.error('Không thể kết nối đến máy chủ dữ liệu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedExpresswayId]);

    useEffect(() => {
        fetchData();
    }, [selectedExpresswayId]);

    const handleDelete = async (sectionId: number | string) => {
        try {
            await axiosClient.delete(`/sections/${sectionId}`);
            message.success('Xóa tuyến đường thành công!');
            fetchData();
        } catch (error: any) {
            console.error('Lỗi khi xóa:', error);
            message.error(error?.response?.data?.message || 'Không thể xóa tuyến đường này!');
        }
    };

    const filteredData = data.filter((item) => {
        const name = item.NameSection || (item as any).sectionName || '';
        const expName = item.expresswayName || '';
        const term = searchText.toLowerCase();
        return name.toLowerCase().includes(term) || expName.toLowerCase().includes(term);
    });

    const EXPRESSWAY_OPTIONS = [
        { key: 100, label: 'Cao tốc Bắc - Nam phía Đông' },
        { key: 200, label: 'Cao tốc Bắc - Nam phía Tây' },
        { key: 300, label: 'Các tuyến đường độc lập' },
    ];

    const columns = [
        {
            title: 'Tên Phân Đoạn / Cao Tốc',
            dataIndex: 'NameSection',
            key: 'NameSection',
            render: (text: string, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                        {text || record.sectionName || 'Chưa đặt tên'}
                    </div>
                    <small style={{ color: '#8c8c8c' }}>
                        {record.expresswayName || 'Cao tốc Bắc - Nam'}
                    </small>
                </div>
            ),
        },
        {
            title: 'Chiều Dài',
            dataIndex: 'totalSectionLength',
            key: 'totalSectionLength',
            width: 110,
            align: 'center' as const,
            render: (len: number, record: any) => (
                <Tag color="blue" style={{ fontSize: '13px', padding: '2px 8px' }}>
                    {(len || record.Length || 0)} km
                </Tag>
            ),
        },
        {
            title: 'Hạ Tầng Kỹ Thuật',
            key: 'infrastructure',
            render: (_: any, record: any) => (
                <Space wrap size={[6, 6]}>
                    <Tag color="purple">{record.bridgeCount || 0} Cầu</Tag>
                    <Tag color="volcano">{record.tunnelCount || 0} Hầm</Tag>
                    <Tag color="orange">{record.interchangeCount || 0} Nút giao</Tag>
                    <Tag color="green">{record.restStopCount || record.restStops || 0} Trạm dừng nghỉ</Tag>
                </Space>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'Status',
            key: 'Status',
            width: 170,
            align: 'center' as const,
            render: (_: any, record: any) => {
                const rawStatus = record?.Status ?? record?.status ?? '';
                const statusVal = String(rawStatus).trim().toLowerCase();

                switch (statusVal) {
                    case 'complete':
                    case 'completed':
                        return <Tag color="#237804">Đang hoạt động</Tag>;

                    case 'under construction':
                    case 'construction':
                        return <Tag color="#1890ff">Đang thi công</Tag>;

                    case 'extend under construction':
                    case 'extend':
                        return <Tag color="#86c5ff">Đang thi công mở rộng</Tag>;

                    case 'not yet construction':
                    case 'not_started':
                    case 'planning':
                        return <Tag color="#faad14">Chưa thi công</Tag>;

                    case 'incident':
                        return <Tag color="#ff4d4f">Đang gặp sự cố</Tag>;

                    case 'maintenance':
                        return <Tag color="#722ed1">Đang bảo trì</Tag>;

                    default:
                        return <Tag color="default">{rawStatus || 'Chưa xác định'}</Tag>;
                }
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 220,
            align: 'center' as const,
            render: (_: any, record: SectionType) => {
                const targetId = (record as any).id || record.SectionId;

                return (
                    <Space size="middle">
                        <Link href={`/manageExpressway/${targetId}`}>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                style={{ backgroundColor: '#1677ff' }}
                            >
                                Cập nhật
                            </Button>
                        </Link>
                        <Popconfirm
                            title="Xóa tuyến đường"
                            description="Bạn có chắc chắn muốn xóa tuyến đường này không?"
                            onConfirm={() => handleDelete(targetId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        }
    ];

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '2000px', margin: '0 auto' }}>
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến đang hoạt động</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#52c41a' }}>
                                    {stats?.totalSectionsCompleted ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến chưa thi công</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#faad14' }}>
                                    {stats?.totalSectionsNotYetUnderConstruction ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến đang thi công</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#1890ff' }}>
                                    {stats?.totalSectionsUnderConstruction ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến đang thi công mở rộng</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#86c5ff' }}>
                                    {stats?.totalSectionsExtendConstruction ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến đang gặp sự cố</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {stats?.totalSectionsIncident ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                <p style={{ color: '#8c8c8c', margin: 0 }}>Số tuyến đang bảo trì</p>
                                <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#722ed1' }}>
                                    {stats?.totalSectionsMaintenance ?? 0} tuyến
                                </h2>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <ManageHeroImagesModal
                    open={isBannerModalOpen}
                    onClose={() => setIsBannerModalOpen(false)}
                />

                <div style={{ padding: '0 24px 24px 24px', maxWidth: '2000px', margin: '0 auto' }}>
                    <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
                        <Row justify="space-between" align="middle">
                            <Col span={10}>
                                <Input
                                    placeholder="Tìm kiếm theo tên phân đoạn hoặc tuyến cao tốc..."
                                    prefix={<SearchOutlined />}
                                    size="large"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                />
                            </Col>
                            <Col>
                                <Space>
                                    <Button size="large">
                                        <EditScoreModal currentScore={score} onScoreChange={handleUpdateScore} /></Button>
                                    <Button
                                        size="large"
                                        icon={<PictureOutlined />}
                                        onClick={() => setIsBannerModalOpen(true)}
                                    >
                                        Quản Lý Ảnh Hero
                                    </Button>

                                    <Button
                                        type="primary"
                                        size="large"
                                        className="addExpressway"
                                        icon={<PlusOutlined />}
                                        onClick={() => router.push('/manageExpressway/addExpressway')}
                                    >
                                        Thêm Phân Đoạn Mới
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
                        <Tabs
                            activeKey={String(selectedExpresswayId)}
                            onChange={(key) => setSelectedExpresswayId(Number(key))}
                            type="card"
                            items={EXPRESSWAY_OPTIONS.map((item) => ({
                                key: String(item.key),
                                label: item.label,
                            }))}
                        />
                    </Card>
                    <Card title={`DANH SÁCH CÁC PHÂN ĐOẠN CAO TỐC`} style={{ borderRadius: '8px' }}>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedExpressway(expresswayDetail);
                                setIsUpdateModalOpen(true);
                            }}
                            style={{marginBottom: '10px'}}
                        >
                            Cập nhật hệ thống tuyến đường
                        </Button>

                        {selectedExpressway && (
                            <UpdateExpresswayModal
                                isOpen={isUpdateModalOpen}
                                onClose={() => setIsUpdateModalOpen(false)}
                                expresswayData={selectedExpressway}
                                onSuccess={() => fetchData()}
                            />
                        )}
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey={(record) => record.SectionId || record.id}
                            loading={loading}
                            pagination={{ pageSize: 7 }}
                            bordered
                        />
                    </Card>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};
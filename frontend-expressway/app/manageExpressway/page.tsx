'use client';

import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";
import Link from "next/link";

interface SectionType {
    SectionId: number;
    ExpresswayId?: number;
    NameSection: string;
    expresswayName?: string;
    Length: number;
    StartLocation?: string;
    StartKm?: number;
    EndLocation?: string;
    EndKm?: number;
    SpeedImage?: string;
    SpeedLimit?: string;
    TrafficLand?: number;
    HasEmergencyLane?: boolean;
    Status?: string;
    bridgeCount?: number;
    tunnelCount?: number;
    interchangeCount?: number;
    totalSectionLength?: number;
}
interface ExpresswayStatistics {
    totalExpressways: number;
    totalSections: number;
    totalSystemLength: number;
    totalSectionsCompleted: number;
    totalSectionsNotYetUnderConstruction: number;
    totalSectionsUnderConstruction: number;
    totalSectionsExtendConstruction: number;
    totalSectionsIncident: number;
    totalSectionsMaintenance: number;
    totalRestStops: number;
    restStopUnderConstruction: number;
    restStopNotYetConstruction: number;
    restStopOperating: number;
    totalUniqueInterchanges: number;
    interchangeUnderConstruction: number;
    interchangeNotYetConstruction: number;
    interchangeComplete: number;
    totalBridges: number;
    totalTunnels: number;
    totalSigns: number;
}

export default function ManageExpresswayPage() {
    const [data, setData] = useState<SectionType[]>([]);
    const [stats, setStats] = useState<ExpresswayStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSection, setEditingSection] = useState<SectionType | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, sectionsRes]: [any, any] = await Promise.all([
                axiosClient.get('/expressways/statistics'),
                axiosClient.get('/sections/statistics')
            ]);

            console.log("=== API STATS RAW RESPONSE ===", statsRes);
            const statsData = statsRes?.data?.data || statsRes?.data || statsRes;
            setStats(statsData);

            const arrayData = sectionsRes?.data?.data || sectionsRes?.data || sectionsRes;
            if (Array.isArray(arrayData)) {
                setData(arrayData);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            message.error('Không thể kết nối đến máy chủ dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (section: SectionType | null = null) => {
        setEditingSection(section);
        if (section) {
            form.setFieldsValue({
                NameSection: section.NameSection || (section as any).sectionName,
                Length: section.Length || section.totalSectionLength || 0,
                StartLocation: section.StartLocation,
                StartKm: section.StartKm,
                EndLocation: section.EndLocation,
                EndKm: section.EndKm,
                Status: section.Status || 'Complete',
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingSection) {
                await axiosClient.put(`/sections/${editingSection.SectionId}`, values);
                message.success('Cập nhật phân đoạn thành công!');
            } else {
                await axiosClient.post('/sections', { ...values, ExpresswayId: 100 });
                message.success('Thêm phân đoạn mới thành công!');
            }

            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error('Lỗi khi lưu phân đoạn:', error);
            message.error(error?.response?.data?.message || 'Thao tác thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sectionId: number) => {
        try {
            setLoading(true);
            await axiosClient.delete(`/sections/${sectionId}`);
            message.success('Đã xóa phân đoạn thành công!');
            fetchData();
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
            message.error('Không thể xóa phân đoạn này!');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter((item) => {
        const name = item.NameSection || (item as any).sectionName || '';
        const expName = item.expresswayName || '';
        const term = searchText.toLowerCase();
        return name.toLowerCase().includes(term) || expName.toLowerCase().includes(term);
    });

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
            width: 140,
            align: 'center' as const,
            render: (status: string) => {
                if (status === 'Complete') return <Tag color="green">Đã hoàn thành</Tag>;
                if (status?.includes('Extend')) return <Tag color="warning">Đang thi công</Tag>;
                return <Tag color="default">{status || 'Chưa xác định'}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            align: 'center' as const,
            render: (_: any, record: SectionType) => (
                <Link href={`/manageExpressway/${(record as any).id || record.SectionId}`}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        style={{ backgroundColor: '#1677ff' }}
                    >
                        Cập nhật tuyến đường
                    </Button>
                </Link>
            ),
        },
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
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    style={{ backgroundColor: '#237804', borderColor: '#237804' }}
                                    onClick={() => openModal(null)}
                                >
                                    Thêm Phân Đoạn Mới
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="DANH SÁCH CÁC PHÂN ĐOẠN CAO TỐC" style={{ borderRadius: '8px' }}>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="SectionId"
                            loading={loading}
                            pagination={{ pageSize: 7 }}
                            bordered
                        />
                    </Card>

                    <Modal
                        title={editingSection ? "✏️ Cập nhật Phân đoạn Cao tốc" : "➕ Thêm Phân đoạn Cao tốc Mới"}
                        open={isModalOpen}
                        onOk={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        okText="Xác nhận"
                        cancelText="Hủy bỏ"
                        confirmLoading={loading}
                        destroyOnClose
                        width={600}
                    >
                        <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                            <Form.Item
                                name="NameSection"
                                label="Tên Phân Đoạn"
                                rules={[{ required: true, message: 'Vui lòng nhập tên phân đoạn!' }]}
                            >
                                <Input placeholder="Ví dụ: Pháp Vân - Cầu Giẽ" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="Length"
                                        label="Chiều dài (km)"
                                        rules={[{ required: true, message: 'Vui lòng nhập chiều dài!' }]}
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 30" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="Status" label="Trạng thái">
                                        <Select
                                            options={[
                                                { value: 'Complete', label: 'Đã hoàn thành' },
                                                { value: 'Extend under construction', label: 'Đang thi công' },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="StartLocation" label="Điểm đầu">
                                        <Input placeholder="VD: Pháp Vân" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="StartKm" label="Km Bắt đầu">
                                        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 182" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="EndLocation" label="Điểm cuối">
                                        <Input placeholder="VD: Đại Xuyên" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="EndKm" label="Km Kết thúc">
                                        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 211.7" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>

                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};
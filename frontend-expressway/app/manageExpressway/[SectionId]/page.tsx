'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Form, Input, InputNumber, Select, Button, Card, 
    Tabs, Table, Popconfirm, Space, Row, Col, Spin, message, Upload 
} from 'antd';
import { 
    ArrowLeftOutlined, SaveOutlined, PlusOutlined, 
    EditOutlined, DeleteOutlined, CloseOutlined 
} from '@ant-design/icons';

import axiosClient from '@/api/axiosClient';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import MainLayout from '@/app/layout/Layout';

const UpdateSectionPage = () => {
    const params = useParams();
    const router = useRouter();

    // 🔑 Lấy duy nhất `SectionId` tương ứng tên thư mục [SectionId]
    const rawSectionId = params?.SectionId;
    const sectionId = Array.isArray(rawSectionId) ? rawSectionId[0] : rawSectionId;

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [sectionData, setSectionData] = useState<any>(null);

    // Danh sách hạ tầng
    const [interchanges, setInterchanges] = useState<any[]>([]);
    const [restStops, setRestStops] = useState<any[]>([]);
    const [bridges, setBridges] = useState<any[]>([]);
    const [tunnels, setTunnels] = useState<any[]>([]);

    // Quản lý ảnh Biển báo tốc độ
    const [speedSignFile, setSpeedSignFile] = useState<File | null>(null);
    const [speedSignUrl, setSpeedSignUrl] = useState<string>('');
    const [isEditingSign, setIsEditingSign] = useState<boolean>(false);

    // State Chỉnh sửa Sub-item
    const [activeTab, setActiveTab] = useState<string>('interchange');
    const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);

    const [mainForm] = Form.useForm();
    const [subForm] = Form.useForm();

    // 1. Fetch dữ liệu phân đoạn
    const fetchSectionData = useCallback(async () => {
        if (!sectionId || sectionId === 'undefined') return;

        setLoading(true);
        try {
            const res: any = await axiosClient.get(`/sections/${sectionId}`);
            const data = res?.data?.data || res?.data || res;

            if (data) {
                setSectionData(data);
                mainForm.setFieldsValue({
                    NameSection: data.NameSection,
                    Length: data.Length,
                    StartLocation: data.StartLocation,
                    StartKm: data.StartKm,
                    EndLocation: data.EndLocation,
                    EndKm: data.EndKm,
                    Status: data.Status,
                    SpeedLimit: data.SpeedLimit,
                });

                setSpeedSignUrl(data.SpeedSign || '');
                setIsEditingSign(false);
                setSpeedSignFile(null);

                setInterchanges(data.interchanges || data.Interchanges || []);
                setRestStops(data.restStops || data.RestStops || []);
                setBridges(data.bridges || data.Bridges || []);
                setTunnels(data.tunnels || data.Tunnels || []);
            }
        } catch (error) {
            console.error('Lỗi tải thông tin tuyến đường:', error);
            message.error('Không thể tải thông tin tuyến đường!');
        } finally {
            setLoading(false);
        }
    }, [sectionId, mainForm]);

    useEffect(() => {
        fetchSectionData();
    }, [fetchSectionData]);

    // 2. Xử lý Sub-items (Nút giao, Cầu, Hầm, Trạm dừng)
    const handleStartEditSubItem = (record: any = null, index: number = -1) => {
        if (record && index !== -1) {
            setEditingSubIndex(index);
            subForm.setFieldsValue(record);
        } else {
            setEditingSubIndex(-1);
            subForm.resetFields();
        }
    };

    const handleCancelSubEdit = () => {
        setEditingSubIndex(null);
        subForm.resetFields();
    };

    const handleSaveSubItemToState = async () => {
        try {
            const values = await subForm.validateFields();

            const updateList = (prevList: any[]) => {
                const list = [...prevList];
                if (editingSubIndex !== null && editingSubIndex >= 0) {
                    // Cập nhật lại và giữ nguyên id cũ nếu có
                    list[editingSubIndex] = { ...list[editingSubIndex], ...values };
                } else {
                    // Thêm mới
                    list.push(values);
                }
                return list;
            };

            switch (activeTab) {
                case 'interchange':
                    setInterchanges(updateList);
                    break;
                case 'restStop':
                    setRestStops(updateList);
                    break;
                case 'bridge':
                    setBridges(updateList);
                    break;
                case 'tunnel':
                    setTunnels(updateList);
                    break;
                default:
                    break;
            }

            message.success('Đã cập nhật danh sách tạm thời!');
            handleCancelSubEdit();
        } catch (error) {
            console.error('Validate sub-form failed:', error);
        }
    };

    const handleDeleteSubItemFromState = (index: number) => {
        const filterList = (prevList: any[]) => prevList.filter((_, i) => i !== index);

        switch (activeTab) {
            case 'interchange': setInterchanges(filterList); break;
            case 'restStop': setRestStops(filterList); break;
            case 'bridge': setBridges(filterList); break;
            case 'tunnel': setTunnels(filterList); break;
        }

        message.success('Đã xóa khỏi danh sách!');
    };

    // 3. Lưu toàn bộ thông tin
    const handleSaveAll = async () => {
        try {
            const mainValues = await mainForm.validateFields();
            setSubmitting(true);

            const formData = new FormData();
            
            // Append main form fields
            Object.keys(mainValues).forEach((key) => {
                if (mainValues[key] !== undefined && mainValues[key] !== null) {
                    formData.append(key, mainValues[key]);
                }
            });

            // Append File nếu có chọn ảnh mới
            if (speedSignFile) {
                formData.append('SpeedSign', speedSignFile);
            }

            // Append danh sách hạ tầng dạng JSON String
            formData.append('interchanges', JSON.stringify(interchanges));
            formData.append('restStops', JSON.stringify(restStops));
            formData.append('bridges', JSON.stringify(bridges));
            formData.append('tunnels', JSON.stringify(tunnels));

            await axiosClient.put(`/sections/${sectionId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            message.success('Cập nhật thành công!');
            fetchSectionData();
        } catch (error: any) {
            console.error('Lỗi lưu dữ liệu:', error);
            message.error(error?.response?.data?.message || 'Không thể cập nhật!');
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Cột của Bảng
    const getSubColumns = (type: string) => [
        { 
            title: 'STT', 
            key: 'index', 
            width: 60, 
            align: 'center' as const,
            render: (_: any, __: any, index: number) => index + 1 
        },
        { 
            title: 'Tên hạ tầng', 
            dataIndex: 'Name', 
            key: 'Name', 
            render: (text: string) => <b>{text}</b> 
        },
        { 
            title: 'Vị trí (Km)', 
            dataIndex: 'KmLocation', 
            key: 'KmLocation', 
            render: (km: number) => (km !== undefined && km !== null ? `Km ${km}` : '-') 
        },
        ...(type === 'bridge' || type === 'tunnel' ? [{ title: 'Chiều dài (m)', dataIndex: 'Length', key: 'Length' }] : []),
        ...(type === 'interchange' ? [{ title: 'Đường kết nối', dataIndex: 'ConnectRoads', key: 'ConnectRoads' }] : []),
        ...(type === 'restStop' ? [{ title: 'Tiện ích', dataIndex: 'Facilities', key: 'Facilities' }] : []),
        {
            title: 'Thao tác',
            key: 'action',
            width: 140,
            align: 'center' as const,
            render: (_: any, record: any, index: number) => (
                <Space size="small">
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleStartEditSubItem(record, index)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa hạ tầng này?"
                        description="Hạ tầng sẽ bị xóa khỏi danh sách tạm thời."
                        onConfirm={() => handleDeleteSubItemFromState(index)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    // Helper kiểm tra URL ảnh chuẩn
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
            return url;
        }
        return `http://localhost:8080/${url.replace(/^\//, '')}`;
    };

    if (loading || !sectionId || sectionId === 'undefined') {
        return (
            <ProtectedRoute role={1}>
                <MainLayout>
                    <div style={{ padding: 100, textAlign: 'center' }}>
                        <Spin size="large" tip="Đang tải dữ liệu tuyến đường..." />
                    </div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push('/manageExpressway')}
                        style={{ marginBottom: 16 }}
                    >
                        Quay lại danh sách
                    </Button>

                    <Card
                        title={`CẬP NHẬT THÔNG TIN: ${sectionData?.NameSection?.toUpperCase() || 'PHÂN ĐOẠN CAO TỐC'}`}
                        style={{ marginBottom: 24, borderRadius: 8 }}
                        extra={
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={submitting}
                                onClick={handleSaveAll}
                                size="large"
                            >
                                Lưu Tất Cả Thay Đổi
                            </Button>
                        }
                    >
                        <Form form={mainForm} layout="vertical">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="NameSection" label="Tên phân đoạn" rules={[{ required: true, message: 'Nhập tên phân đoạn!' }]}>
                                        <Input placeholder="Ví dụ: Phân đoạn Phan Thiết - Dầu Giây" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="Length" label="Chiều dài toàn tuyến (Km)" rules={[{ required: true, message: 'Nhập chiều dài!' }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 99" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="Status" label="Trạng thái hoạt động">
                                        <Select options={[
                                            { value: 'Complete', label: 'Đã hoàn thành' },
                                            { value: 'Extend under construction', label: 'Đang thi công / mở rộng' },
                                            { value: 'Maintenance', label: 'Đang bảo trì' },
                                        ]} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={6}><Form.Item name="StartLocation" label="Điểm đầu"><Input placeholder="VD: Nút giao Dầu Giây" /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="StartKm" label="Km Bắt đầu"><InputNumber style={{ width: '100%' }} placeholder="VD: 0" /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="EndLocation" label="Điểm cuối"><Input placeholder="VD: Vĩnh Hảo" /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="EndKm" label="Km Kết thúc"><InputNumber style={{ width: '100%' }} placeholder="VD: 99" /></Form.Item></Col>
                            </Row>

                            {/* KHU VỰC: BIỂN BÁO & TỐC ĐỘ */}
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="SpeedLimit" label="Mô tả / Giới hạn tốc độ">
                                        <Input.TextArea
                                            rows={4}
                                            placeholder="VD: Tốc độ tối đa 120km/h, tối thiểu 60km/h..."
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item label="Hình ảnh biển báo tốc độ (SpeedSign)">
                                        {!isEditingSign ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                {speedSignUrl ? (
                                                    <img
                                                        src={getImageUrl(speedSignUrl)}
                                                        alt="Biển báo hiện tại"
                                                        style={{
                                                            width: 240,
                                                            height: 140,
                                                            objectFit: 'contain',
                                                            borderRadius: 8,
                                                            border: '1px solid #d9d9d9',
                                                            padding: 4,
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#8c8c8c' }}>Chưa có biển báo</span>
                                                )}

                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => setIsEditingSign(true)}
                                                >
                                                    Thay đổi biển báo
                                                </Button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Upload
                                                    name="file"
                                                    listType="picture-card"
                                                    maxCount={1}
                                                    beforeUpload={(file) => {
                                                        setSpeedSignFile(file);
                                                        return false; // Chặn auto upload
                                                    }}
                                                    onRemove={() => setSpeedSignFile(null)}
                                                    fileList={
                                                        speedSignFile
                                                            ? [{ uid: '-1', name: speedSignFile.name, status: 'done' }]
                                                            : []
                                                    }
                                                >
                                                    {!speedSignFile && (
                                                        <div>
                                                            <PlusOutlined />
                                                            <div style={{ marginTop: 8 }}>Chọn ảnh mới</div>
                                                        </div>
                                                    )}
                                                </Upload>

                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => {
                                                        setIsEditingSign(false);
                                                        setSpeedSignFile(null);
                                                    }}
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    {/* QUẢN LÝ HẠ TẦNG KĨ THUẬT */}
                    <Card title="QUẢN LÝ HẠ TẦNG KỸ THUẬT" style={{ borderRadius: 8 }}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={(key) => {
                                setActiveTab(key);
                                handleCancelSubEdit();
                            }}
                            items={[
                                { key: 'interchange', label: `Nút giao (${interchanges.length})` },
                                { key: 'restStop', label: `Trạm dừng nghỉ (${restStops.length})` },
                                { key: 'bridge', label: `Cầu (${bridges.length})` },
                                { key: 'tunnel', label: `Đường hầm (${tunnels.length})` },
                            ]}
                        />

                        {editingSubIndex === null && (
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => handleStartEditSubItem(null, -1)}
                                style={{ marginBottom: 16 }}
                            >
                                Thêm {activeTab === 'interchange' ? 'Nút giao' : activeTab === 'restStop' ? 'Trạm dừng nghỉ' : activeTab === 'bridge' ? 'Cầu' : 'Hầm'} mới
                            </Button>
                        )}

                        <Table
                            columns={getSubColumns(activeTab)}
                            dataSource={
                                activeTab === 'interchange' ? interchanges :
                                activeTab === 'restStop' ? restStops :
                                activeTab === 'bridge' ? bridges : tunnels
                            }
                            rowKey={(record, index) => record?._id || record?.id || `sub-item-${index}`}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />

                        {/* FORM SỬA / THÊM HẠ TẦNG CON */}
                        {editingSubIndex !== null && (
                            <Card
                                type="inner"
                                title={editingSubIndex >= 0 ? "✏️ Cập nhật thông tin hạ tầng" : "➕ Thêm hạ tầng mới"}
                                style={{ marginTop: 24, backgroundColor: '#fafafa', border: '1px solid #d9d9d9' }}
                                extra={<Button icon={<CloseOutlined />} onClick={handleCancelSubEdit}>Hủy</Button>}
                            >
                                <Form form={subForm} layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="Name" label="Tên hạ tầng" rules={[{ required: true, message: 'Nhập tên hạ tầng!' }]}>
                                                <Input placeholder="Ví dụ: Nút giao Chợ Đệm, Cầu Sông Phan..." />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="KmLocation" label="Vị trí (Km)">
                                                <InputNumber style={{ width: '100%' }} placeholder="VD: 45.5" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {(activeTab === 'bridge' || activeTab === 'tunnel') && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="Length" label="Chiều dài (mét)">
                                                    <InputNumber style={{ width: '100%' }} placeholder="VD: 500" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}

                                    {activeTab === 'interchange' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={24}>
                                                <Form.Item name="ConnectRoads" label="Đường kết nối">
                                                    <Input placeholder="VD: Quốc lộ 1A, Tỉnh lộ 765" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}

                                    {activeTab === 'restStop' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={24}>
                                                <Form.Item name="Facilities" label="Tiện ích">
                                                    <Input placeholder="VD: Trạm xăng, Cửa hàng tiện lợi, Bãi xe tải" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}

                                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                                        <Space>
                                            <Button onClick={handleCancelSubEdit}>Hủy bỏ</Button>
                                            <Button type="primary" onClick={handleSaveSubItemToState}>
                                                Cập nhật vào danh sách
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>
                        )}
                    </Card>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default UpdateSectionPage;
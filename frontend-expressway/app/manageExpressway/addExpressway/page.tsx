'use client';

import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, message, Row, Col, Divider, Spin } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axiosClient';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import MainLayout from '@/app/layout/Layout';

export default function CreateExpresswayPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [interchanges, setInterchanges] = useState<any[]>([]);
    const [bridges, setBridges] = useState<any[]>([]);
    const [restStops, setRestStops] = useState<any[]>([]);
    const [tunnels, setTunnels] = useState<any[]>([]);

    const handleAddSubItem = (setState: React.Dispatch<React.SetStateAction<any[]>>, initialData: object) => {
        setState((prev) => [...prev, { _tempId: Date.now(), ...initialData }]);
    };

    const handleRemoveSubItem = (setState: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
        setState((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubItemChange = (
        setState: React.Dispatch<React.SetStateAction<any[]>>,
        index: number,
        field: string,
        value: any
    ) => {
        setState((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSaveAll = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const sectionPayload = {
                NameSection: values.NameSection,
                TotalLength: values.TotalLength,
                Status: values.Status,
                StartLocation: values.StartLocation,
                StartKm: values.StartKm,
                EndLocation: values.EndLocation,
                EndKm: values.EndKm,
                Description: values.Description,
            };

            const sectionRes = await axiosClient.post('/sections', sectionPayload);
            const newSectionId = sectionRes.data?.SectionId || sectionRes.data?.id;

            if (!newSectionId) {
                throw new Error('Không nhận được SectionId mới từ máy chủ');
            }

            const saveSubItems = (items: any[], endpoint: string) => {
                return items.map((item) => {
                    const { _tempId, ...itemPayload } = item;
                    return axiosClient.post(endpoint, {
                        ...itemPayload,
                        SectionId: Number(newSectionId),
                    });
                });
            };

            const apiRequests = [
                ...saveSubItems(interchanges, '/interchanges'),
                ...saveSubItems(bridges, '/bridges'),
                ...saveSubItems(restStops, '/rest-stops'),
                ...saveSubItems(tunnels, '/tunnels'),
            ];

            if (apiRequests.length > 0) {
                await Promise.all(apiRequests);
            }

            message.success('Thêm mới tuyến đường thành công!');
            router.push('/manageExpressway');
        } catch (error: any) {
            console.error('Lỗi khi thêm mới:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo mới dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <Spin spinning={loading} tip="Đang xử lý tạo mới dữ liệu...">
                    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Space size="middle">
                                <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                                    Quay lại danh sách
                                </Button>
                                <h2 style={{ margin: 0 }}>THÊM MỚI TUYẾN ĐƯỜNG / PHÂN ĐOẠN</h2>
                            </Space>
                            <Button type="primary" icon={<SaveOutlined />} size="large" onClick={handleSaveAll}>
                                Lưu Tuyến Đường Mới
                            </Button>
                        </div>
                        <Card title="Thông tin phân đoạn" style={{ marginBottom: 24 }}>
                            <Form form={form} layout="vertical">
                                <Row gutter={16}>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="ExpresswayId"
                                            label="Thuộc Tuyến Cao Tốc"
                                            rules={[{ required: true, message: 'Vui lòng chọn tuyến cao tốc!' }]}
                                        >
                                            <Select
                                                placeholder="Chọn tuyến cao tốc quản lý"
                                                allowClear
                                                options={[
                                                    { value: 100, label: 'Cao tốc Bắc - Nam phía Đông (Eastern North South Expressway)' },
                                                    { value: 200, label: 'Cao tốc Bắc - Nam phía Tây (Western North South Expressway)' },
                                                    { value: 300, label: 'Tuyến Cao tốc Độc lập (Unique Expressways)' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="NameSection"
                                            label="Tên phân đoạn"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên phân đoạn' }]}
                                        >
                                            <Input placeholder="Nhập tên phân đoạn (VD: Cầu Giẽ - Ninh Bình)" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="TotalLength"
                                            label="Chiều dài toàn tuyến (Km)"
                                            rules={[{ required: true, message: 'Vui lòng nhập chiều dài' }]}
                                        >
                                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 50" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="Status"
                                            label="Trạng thái hoạt động"
                                            initialValue="Đang hoạt động"
                                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                                        >
                                            <Select options={[
                                                { value: 'Not yet construction', label: 'Chưa thi công' },
                                                { value: 'Under construction', label: 'Đang thi công' },
                                                { value: 'Complete', label: 'Đang hoạt động' },
                                                { value: 'Maintenance', label: 'Đang bảo trì' },
                                                { value: "Extend under construction", label: "Đang thi công mở rộng" },
                                                { value: "Incident", label: "Đang gặp sự cố" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="StartLocation" label="Điểm đầu">
                                            <Input placeholder="VD: Đại Xuyên" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="StartKm" label="Km Bắt đầu">
                                            <Input placeholder="VD: 211.7" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="EndLocation" label="Điểm cuối">
                                            <Input placeholder="VD: Cao Bồ" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="EndKm" label="Km Kết thúc">
                                            <Input placeholder="VD: 260.2" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="Description" label="Mô tả / Giới hạn tốc độ">
                                    <Input.TextArea rows={3} placeholder="Mô tả quy mô tuyến đường, giới hạn tốc độ..." />
                                </Form.Item>
                            </Form>
                        </Card>

                        <Card
                            title="Danh sách Nút giao (Interchanges)"
                            style={{ marginBottom: 24 }}
                            extra={
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        handleAddSubItem(setInterchanges, {
                                            NameInterchange: '',
                                            Type: '',
                                            Location: '',
                                            Longitude: 0,
                                            Latitude: 0,
                                        })
                                    }
                                >
                                    Thêm Nút Giao
                                </Button>
                            }
                        >
                            {interchanges.map((item, index) => (
                                <div key={item._tempId || index} style={{ marginBottom: 16, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <p>Tên nút giao</p>
                                            <Input
                                                placeholder="Tên nút giao"
                                                value={item.NameInterchange}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'NameInterchange', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p>Loại nút giao</p>
                                            <Input
                                                placeholder="Loại (VD: Trumpet, Roundabout)"
                                                value={item.Type}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'Type', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p>Vị trí</p>
                                            <Input
                                                placeholder="Vị trí (Km)"
                                                value={item.Location}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'Location', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p>Kinh độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Kinh độ (Longitude)"
                                                value={item.Longitude}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'Longitude', val)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p>Vĩ độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Vĩ độ (Latitude)"
                                                value={item.Latitude}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'Latitude', val)}
                                            />
                                        </Col>
                                        <Col span={2}>
                                            <p>Xóa</p>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setInterchanges, index)}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {interchanges.length === 0 && <p style={{ color: '#8c8c8c' }}>Chưa có nút giao nào được thêm.</p>}
                        </Card>

                        <Card
                            title="Danh sách Cầu (Bridges)"
                            style={{ marginBottom: 24 }}
                            extra={
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        handleAddSubItem(setBridges, {
                                            NameBridge: '',
                                            Length: 0,
                                            Type: '',
                                            Crossing: '',
                                        })
                                    }
                                >
                                    Thêm Cầu
                                </Button>
                            }
                        >
                            {bridges.map((item, index) => (
                                <div key={item._tempId || index} style={{ marginBottom: 16, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={6}>
                                            <Input
                                                placeholder="Tên cầu"
                                                value={item.NameBridge}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'NameBridge', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Chiều dài (m)"
                                                value={item.Length}
                                                onChange={(val) => handleSubItemChange(setBridges, index, 'Length', val)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <Input
                                                placeholder="Loại cầu (Overpass, River...)"
                                                value={item.Type}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'Type', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Input
                                                placeholder="Bắc qua (Crossing)"
                                                value={item.Crossing}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'Crossing', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={2}>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setBridges, index)}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {bridges.length === 0 && <p style={{ color: '#8c8c8c' }}>Chưa có cầu nào được thêm.</p>}
                        </Card>

                        <Card
                            title="Danh sách Trạm Dừng Nghỉ (Rest Stops)"
                            style={{ marginBottom: 24 }}
                            extra={
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        handleAddSubItem(setRestStops, {
                                            NameRestStop: '',
                                            Location: '',
                                            Longitude: 0,
                                            Latitude: 0,
                                        })
                                    }
                                >
                                    Thêm Trạm Dừng Nghỉ
                                </Button>
                            }
                        >
                            {restStops.map((item, index) => (
                                <div key={item._tempId || index} style={{ marginBottom: 16, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={7}>
                                            <Input
                                                placeholder="Tên trạm dừng nghỉ"
                                                value={item.NameRestStop}
                                                onChange={(e) => handleSubItemChange(setRestStops, index, 'NameRestStop', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <Input
                                                placeholder="Vị trí (Km)"
                                                value={item.Location}
                                                onChange={(e) => handleSubItemChange(setRestStops, index, 'Location', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Kinh độ"
                                                value={item.Longitude}
                                                onChange={(val) => handleSubItemChange(setRestStops, index, 'Longitude', val)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Vĩ độ"
                                                value={item.Latitude}
                                                onChange={(val) => handleSubItemChange(setRestStops, index, 'Latitude', val)}
                                            />
                                        </Col>
                                        <Col span={2}>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setRestStops, index)}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {restStops.length === 0 && <p style={{ color: '#8c8c8c' }}>Chưa có trạm dừng nghỉ nào được thêm.</p>}
                        </Card>

                        <Card
                            title="Danh sách Hầm (Tunnels)"
                            style={{ marginBottom: 24 }}
                            extra={
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        handleAddSubItem(setTunnels, {
                                            NameTunnel: '',
                                            Length: 0,
                                            Height: 0,
                                            MaxSpeed: 80,
                                        })
                                    }
                                >
                                    Thêm Hầm
                                </Button>
                            }
                        >
                            {tunnels.map((item, index) => (
                                <div key={item._tempId || index} style={{ marginBottom: 16, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
                                    <Row gutter={12} align="middle">
                                        <Col span={7}>
                                            <Input
                                                placeholder="Tên hầm"
                                                value={item.NameTunnel}
                                                onChange={(e) => handleSubItemChange(setTunnels, index, 'NameTunnel', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Chiều dài (m)"
                                                value={item.Length}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'Length', val)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Chiều cao tĩnh không (m)"
                                                value={item.Height}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'Height', val)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Tốc độ tối đa (km/h)"
                                                value={item.MaxSpeed}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'MaxSpeed', val)}
                                            />
                                        </Col>
                                        <Col span={2}>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setTunnels, index)}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {tunnels.length === 0 && <p style={{ color: '#8c8c8c' }}>Chưa có hầm nào được thêm.</p>}
                        </Card>
                    </div>
                </Spin>
            </MainLayout>
        </ProtectedRoute>
    );
}
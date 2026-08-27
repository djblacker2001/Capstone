'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Space, message, Row, Col, Spin, Upload, Checkbox } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axiosClient from '@/api/axiosClient';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import MainLayout from '@/app/layout/Layout';
import "./addExpressway.css";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
interface Province {
    ProvinceId: number;
    ProvinceName: string;
    Region: string;
}

export default function CreateExpresswayPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [interchanges, setInterchanges] = useState<any[]>([]);
    const [bridges, setBridges] = useState<any[]>([]);
    const [restStops, setRestStops] = useState<any[]>([]);
    const [tunnels, setTunnels] = useState<any[]>([]);
    const [speedSignFile, setSpeedSignFile] = useState<File | null>(null);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
    const [mapDataFile, setMapDataFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const res = await axiosClient.get('/provinces');
                const data = res?.data?.data || res?.data || res;
                if (Array.isArray(data)) {
                    setProvinces(data);
                }
            } catch (error) {
                console.error(error);
                message.error('Không thể tải danh sách tỉnh thành!');
            } finally {
                setLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

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
            let parsedMapData = null;
            if (mapDataFile) {
                try {
                    const text = await mapDataFile.text();
                    parsedMapData = JSON.parse(text);
                } catch (err) {
                    message.error('File MapData không đúng định dạng JSON!');
                    setLoading(false);
                    return;
                }
            }

            const provinceIds = Array.isArray(values.ProvinceIds)
                ? values.ProvinceIds.map((id: any) => Number(id))
                : [];

            const sectionPayload = {
                ExpresswayId: Number(values.ExpresswayId),
                NameSection: values.NameSection,
                Length: Number(values.Length),
                Status: values.Status,
                StartLocation: values.StartLocation || '',
                StartKm: Number(values.StartKm) || 0,
                EndLocation: values.EndLocation || '',
                EndKm: Number(values.EndKm) || 0,
                TrafficLand: values.TrafficLand ? Number(values.TrafficLand) : 4,
                HasEmergencyLand: values.HasEmergencyLand ?? false,
                Description: values.Description || '',
                MapData: parsedMapData,
                ProvinceIds: provinceIds,
            };

            console.log('Payload gửi lên /sections:', sectionPayload);

            const sectionRes = await axiosClient.post('/sections', sectionPayload);

        } catch (error: any) {
            console.error('Lỗi khi thêm mới:', error);
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
                                            <Input placeholder="Nhập tên phân đoạn (VD: Cam Lâm - Vĩnh Hảo)" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="Length"
                                            label="Chiều dài toàn tuyến (Km)"
                                            rules={[{ required: true, message: 'Vui lòng nhập chiều dài' }]}
                                        >
                                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 78.5" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item
                                            name="Status"
                                            label="Trạng thái hoạt động"
                                            initialValue="Complete"
                                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                                        >
                                            <Select options={[
                                                { value: 'Not yet construction', label: 'Chưa thi công' },
                                                { value: 'Under construction', label: 'Đang thi công' },
                                                { value: 'Complete', label: 'Đang hoạt động' },
                                                { value: 'Maintenance', label: 'Đang bảo trì' },
                                                { value: 'Extend under construction', label: 'Đang thi công mở rộng' },
                                                { value: 'Incident', label: 'Đang gặp sự cố' }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="StartLocation" label="Điểm đầu">
                                            <Input placeholder="VD: Cam Lâm" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="StartKm" label="Km Bắt đầu">
                                            <Input placeholder="VD: 54+000" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="EndLocation" label="Điểm cuối">
                                            <Input placeholder="VD: Vĩnh Hảo" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="EndKm" label="Km Kết thúc">
                                            <Input placeholder="VD: 132+500" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="ProvinceIds"
                                            label="Tỉnh / Thành phố đi qua"
                                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tỉnh thành!' }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                placeholder="Chọn các tỉnh thành"
                                                loading={loadingProvinces}
                                                options={provinces.map((p: any) => ({
                                                    label: p.ProvinceName || p.name,
                                                    value: p.ProvinceId || p.id,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Dữ liệu Bản đồ GIS (File JSON)"
                                            extra="Tải lên file .json hoặc .geojson chứa tọa độ tuyến đường"
                                        >
                                            <Upload
                                                accept=".json,.geojson"
                                                maxCount={1}
                                                beforeUpload={(file) => {
                                                    setMapDataFile(file);
                                                    return false;
                                                }}
                                                onRemove={() => setMapDataFile(null)}
                                            >
                                                <Button icon={<UploadOutlined />}>Chọn file MapData (.json)</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="TrafficLand" label="Số làn xe chạy"><InputNumber style={{ width: '100%' }} /></Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item
                                                    name="HasEmergencyLand"
                                                    label="Làn dừng khẩn cấp"
                                                    style={{ width: '100%' }}
                                                >
                                                    <Select placeholder="Chọn trạng thái">
                                                        <Select.Option value={true}>Có</Select.Option>
                                                        <Select.Option value={false}>Không</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24}><Form.Item name="SpeedLimit" label="Mô tả / Giới hạn tốc độ"><Input.TextArea rows={4} /></Form.Item></Col>

                                        </Row>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Hình ảnh biển báo tốc độ (SpeedSign)">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                maxCount={1}
                                                beforeUpload={(file) => {
                                                    setSpeedSignFile(file);
                                                    return false;
                                                }}
                                                onRemove={() => setSpeedSignFile(null)}
                                            >
                                                {!speedSignFile && (
                                                    <div>
                                                        <PlusOutlined />
                                                        <div style={{ marginTop: 8 }}>Tải ảnh biển báo</div>
                                                    </div>
                                                )}
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>
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
                                            BOT: 'Nop',
                                            Connection: '',
                                            Status: 'Complete',
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
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tên nút giao</p>
                                            <Input
                                                placeholder="Tên nút giao"
                                                value={item.NameInterchange}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'NameInterchange', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Loại nút giao</p>
                                            <Input
                                                placeholder="Loại (Trumpet, Diamond...)"
                                                value={item.Type}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'Type', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Vị trí (Km)</p>
                                            <Input
                                                placeholder="Vị trí (Km)"
                                                value={item.Location}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'Location', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Kinh độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Longitude"
                                                value={item.Longitude}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'Longitude', val || 0)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Vĩ độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Latitude"
                                                value={item.Latitude}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'Latitude', val || 0)}
                                            />
                                        </Col>
                                        <Col span={2} style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Xóa</p>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setInterchanges, index)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]} align="middle" style={{ marginTop: 12 }}>
                                        <Col span={10}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Kết nối tới tuyến đường / QL</p>
                                            <Input
                                                placeholder="Ví dụ: QL1A, QL45, ĐT848..."
                                                value={item.Connection}
                                                onChange={(e) => handleSubItemChange(setInterchanges, index, 'Connection', e.target.value)}
                                            />
                                        </Col>

                                        <Col span={7}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Trạng thái BOT / Thu phí</p>
                                            <Select
                                                style={{ width: '100%' }}
                                                value={item.BOT || 'Nop'}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'BOT', val)}
                                                options={[
                                                    { value: 'Nop', label: 'Nop (Không có)' },
                                                    { value: 'Operating', label: 'Operating (Đang hoạt động)' },
                                                    { value: 'Under construction', label: 'Under construction (Đang thi công)' },
                                                    { value: 'Not yet construction', label: 'Not yet construction (Chưa thi công)' },
                                                ]}
                                            />
                                        </Col>

                                        <Col span={7}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Trạng thái Nút giao</p>
                                            <Select
                                                style={{ width: '100%' }}
                                                value={item.Status || 'Complete'}
                                                onChange={(val) => handleSubItemChange(setInterchanges, index, 'Status', val)}
                                                options={[
                                                    { value: 'Complete', label: 'Complete (Hoàn thành)' },
                                                    { value: 'Under construction', label: 'Under construction (Đang thi công)' },
                                                    { value: 'Not yet construction', label: 'Not yet construction (Chưa thi công)' },
                                                ]}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            {interchanges.length === 0 && <p style={{ color: '#8c8c8c', margin: 0 }}>Chưa có nút giao nào được thêm.</p>}
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
                                            HasPetrol: false,
                                            HasFood: false,
                                            HasToilet: true,
                                            Status: 'Complete',
                                        })
                                    }
                                >
                                    Thêm Trạm Dừng Nghỉ
                                </Button>
                            }
                        >
                            {restStops.map((item, index) => (
                                <div key={item._tempId || index} style={{ marginBottom: 16, borderBottom: '1px dashed #ccc', paddingBottom: 16 }}>
                                    <Row gutter={[12, 12]} align="middle">
                                        <Col span={7}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tên trạm dừng nghỉ</p>
                                            <Input
                                                placeholder="Tên trạm dừng nghỉ"
                                                value={item.NameRestStop}
                                                onChange={(e) => handleSubItemChange(setRestStops, index, 'NameRestStop', e.target.value)}
                                            />
                                        </Col>

                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Vị trí (Km)</p>
                                            <Input
                                                placeholder="Vị trí (Km)"
                                                value={item.Location}
                                                onChange={(e) => handleSubItemChange(setRestStops, index, 'Location', e.target.value)}
                                            />
                                        </Col>

                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Kinh độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Longitude"
                                                value={item.Longitude}
                                                onChange={(val) => handleSubItemChange(setRestStops, index, 'Longitude', val || 0)}
                                            />
                                        </Col>

                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Vĩ độ</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Latitude"
                                                value={item.Latitude}
                                                onChange={(val) => handleSubItemChange(setRestStops, index, 'Latitude', val || 0)}
                                            />
                                        </Col>

                                        <Col span={3}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Trạng thái</p>
                                            <Select
                                                style={{ width: '100%' }}
                                                value={item.Status || 'Complete'}
                                                onChange={(val) => handleSubItemChange(setRestStops, index, 'Status', val)}
                                                options={[
                                                    { value: 'Complete', label: 'Complete (Hoàn thành)' },
                                                    { value: 'Under construction', label: 'Under construction (Đang thi công)' },
                                                    { value: 'Not yet construction', label: 'Not yet construction (Chưa thi công)' },
                                                ]}
                                            />
                                        </Col>

                                        <Col span={2} style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Xóa</p>
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveSubItem(setRestStops, index)}
                                            />
                                        </Col>
                                    </Row>

                                    <Row gutter={[12, 12]} align="middle" style={{ marginTop: 12 }}>
                                        <Col span={24}>
                                            <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>Tiện ích / Dịch vụ sẵn có:</p>
                                            <Space size="large">
                                                <Checkbox
                                                    checked={Boolean(item.HasPetrol)}
                                                    onChange={(e) => handleSubItemChange(setRestStops, index, 'HasPetrol', e.target.checked)}
                                                >
                                                    Trạm xăng
                                                </Checkbox>

                                                <Checkbox
                                                    checked={Boolean(item.HasFood)}
                                                    onChange={(e) => handleSubItemChange(setRestStops, index, 'HasFood', e.target.checked)}
                                                >
                                                    Ăn uống
                                                </Checkbox>

                                                <Checkbox
                                                    checked={Boolean(item.HasToilet)}
                                                    onChange={(e) => handleSubItemChange(setRestStops, index, 'HasToilet', e.target.checked)}
                                                >
                                                    Nhà vệ sinh
                                                </Checkbox>
                                            </Space>
                                        </Col>
                                    </Row>
                                </div>
                            ))}

                            {restStops.length === 0 && <p style={{ color: '#8c8c8c', margin: 0 }}>Chưa có trạm dừng nghỉ nào được thêm.</p>}
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
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tên cầu</p>
                                            <Input
                                                placeholder="Tên cầu"
                                                value={item.NameBridge}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'NameBridge', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Chiều dài (m)</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Chiều dài (m)"
                                                value={item.Length}
                                                onChange={(val) => handleSubItemChange(setBridges, index, 'Length', val || 0)}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Loại cầu</p>
                                            <Input
                                                placeholder="Loại cầu (Cầu vượt, Cầu sông...)"
                                                value={item.Type}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'Type', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Bắc qua</p>
                                            <Input
                                                placeholder="Sông / Đường cắt ngang"
                                                value={item.Crossing}
                                                onChange={(e) => handleSubItemChange(setBridges, index, 'Crossing', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={2} style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Xóa</p>
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
                            {bridges.length === 0 && <p style={{ color: '#8c8c8c', margin: 0 }}>Chưa có cầu nào được thêm.</p>}
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
                                            Location: '',
                                            MaxSpeed: 70,
                                            MinSpeed: 50,
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
                                        <Col span={6}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tên hầm</p>
                                            <Input
                                                placeholder="Tên hầm (VD: Hầm Đèo Cả)"
                                                value={item.NameTunnel}
                                                onChange={(e) => handleSubItemChange(setTunnels, index, 'NameTunnel', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Chiều dài (m)</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Chiều dài (m)"
                                                value={item.Length}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'Length', val || 0)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Vị trí (Km)</p>
                                            <Input
                                                placeholder="Vị trí (Km)"
                                                value={item.Location}
                                                onChange={(e) => handleSubItemChange(setTunnels, index, 'Location', e.target.value)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tốc độ tối đa (km/h)</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={120}
                                                placeholder="VD: 70"
                                                value={item.MaxSpeed}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'MaxSpeed', val || 0)}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Tốc độ tối thiểu (km/h)</p>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={120}
                                                placeholder="VD: 50"
                                                value={item.MinSpeed}
                                                onChange={(val) => handleSubItemChange(setTunnels, index, 'MinSpeed', val || 0)}
                                            />
                                        </Col>
                                        <Col span={2} style={{ textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Xóa</p>
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
                            {tunnels.length === 0 && <p style={{ color: '#8c8c8c', margin: 0 }}>Chưa có hầm nào được thêm.</p>}
                        </Card>
                    </div>
                </Spin>
            </MainLayout>
        </ProtectedRoute>
    );
}
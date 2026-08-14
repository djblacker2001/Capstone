'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, Button, Card, Tabs, Table, Popconfirm, Space, Row, Col, Spin, message, Upload, Checkbox } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import axiosClient from '@/api/axiosClient';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import MainLayout from '@/app/layout/Layout';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function UpdateSectionPage() {
    const params = useParams();
    const router = useRouter();
    const rawSectionId = params?.SectionId;
    const sectionId = Array.isArray(rawSectionId) ? rawSectionId[0] : rawSectionId;

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [sectionData, setSectionData] = useState<any>(null);
    const [interchanges, setInterchanges] = useState<any[]>([]);
    const [restStops, setRestStops] = useState<any[]>([]);
    const [bridges, setBridges] = useState<any[]>([]);
    const [tunnels, setTunnels] = useState<any[]>([]);
    const [speedSignFile, setSpeedSignFile] = useState<File | null>(null);
    const [speedSignUrl, setSpeedSignUrl] = useState<string>('');
    const [isEditingSign, setIsEditingSign] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('interchange');
    const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);

    const [mainForm] = Form.useForm();
    const [subForm] = Form.useForm();

    const fetchSectionData = useCallback(async () => {
        if (!sectionId || sectionId === 'undefined') return;

        setLoading(true);
        try {
            const [sectionRes, interchangeRes, restStopRes, bridgeRes, tunnelRes]: any[] = await Promise.all([
                axiosClient.get(`/sections/${sectionId}`),
                axiosClient.get(`/interchanges?sectionId=${sectionId}`),
                axiosClient.get(`/rest-stops?sectionId=${sectionId}`),
                axiosClient.get(`/bridges?sectionId=${sectionId}`),
                axiosClient.get(`/tunnels?sectionId=${sectionId}`),
            ]);
            
            const data = sectionRes?.data?.data || sectionRes?.data || sectionRes;
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
            }

            const filterBySectionId = (res: any) => {
                const rawList = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
                const targetId = Number(sectionId);
                return rawList.filter((item: any) => Number(item.SectionId) === targetId);
            };
            
            setInterchanges(filterBySectionId(interchangeRes));
            setRestStops(filterBySectionId(restStopRes));
            setBridges(filterBySectionId(bridgeRes));
            setTunnels(filterBySectionId(tunnelRes));

        } catch (error) {
            console.error('Lỗi tải thông tin:', error);
            message.error('Không thể tải dữ liệu tuyến đường!');
        } finally {
            setLoading(false);
        }
    }, [sectionId, mainForm]);

    useEffect(() => {
        fetchSectionData();
    }, [fetchSectionData]);

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
                    list[editingSubIndex] = { ...list[editingSubIndex], ...values };
                } else {
                    list.push(values);
                }
                return list;
            };

            switch (activeTab) {
                case 'interchange': setInterchanges(updateList); break;
                case 'restStop': setRestStops(updateList); break;
                case 'bridge': setBridges(updateList); break;
                case 'tunnel': setTunnels(updateList); break;
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

        message.success('Đã xóa khỏi danh sách tạm thời!');
    };

    const handleSaveAll = async () => {
        try {
            const mainValues = await mainForm.validateFields();
            setSubmitting(true);
            const formData = new FormData();
            Object.keys(mainValues).forEach((key) => {
                if (mainValues[key] !== undefined && mainValues[key] !== null) {
                    formData.append(key, mainValues[key]);
                }
            });

            if (speedSignFile) {
                formData.append('SpeedSign', speedSignFile);
            }

            await axiosClient.put(`/sections/${sectionId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const saveSubItems = (items: any[], endpoint: string, idKey: string) => {
                return items.map((item) => {
                    const itemId = item[idKey] || item._id || item.id;
                    const { [idKey]: currentId, _id, id, ...payloadWithoutId } = item;
                    const payload = { ...payloadWithoutId, SectionId: Number(sectionId) };
                    const url = itemId ? `${endpoint}/${itemId}` : endpoint;
                    const method = itemId ? 'PUT' : 'POST';
                    console.log(`Sending ${method} to: ${url}`, payload);

                    if (itemId) {
                        return axiosClient.put(`${endpoint}/${itemId}`, payload);
                    } else {
                        return axiosClient.post(endpoint, payload);
                    }
                });
            };

            const apiRequests = [
                ...saveSubItems(interchanges, '/interchanges', 'InterchangeId'),
                ...saveSubItems(restStops, '/rest-stops', 'RestStopId'),
                ...saveSubItems(bridges, '/bridges', 'BridgeId'),
                ...saveSubItems(tunnels, '/tunnels', 'TunnelId'),
            ];

            if (apiRequests.length > 0) {
                await Promise.all(apiRequests);
            }

            message.success('Cập nhật thành công toàn bộ thông tin!');
            fetchSectionData();
            router.push('/manageExpressway');
        } catch (error: any) {
            console.error('Lỗi lưu dữ liệu:', error);
            message.error(error?.response?.data?.message || 'Không thể cập nhật!');
        } finally {
            setSubmitting(false);
        }
    };

    const getSubColumns = (type: string) => {
        const baseColumns: any[] = [
            { title: 'STT', key: 'index', width: 60, align: 'center', render: (_: any, __: any, i: number) => i + 1 },
        ];

        if (type === 'interchange') {
            baseColumns.push(
                { title: 'Tên nút giao', dataIndex: 'NameInterchange', render: (t: string) => <b>{t}</b> },
                { title: 'Vị trí (Km)', dataIndex: 'Location', render: (l: any) => l ? `Km ${l}` : '-' },
                { title: 'Loại', dataIndex: 'Type' },
                { title: 'Đường kết nối', dataIndex: 'Connection' },
                { title: 'Trạng thái', dataIndex: 'Status' }
            );
        } else if (type === 'restStop') {
            baseColumns.push(
                { title: 'Tên trạm dừng', dataIndex: 'NameRestStop', render: (t: string) => <b>{t}</b> },
                { title: 'Vị trí (Km)', dataIndex: 'Location', render: (l: any) => l ? `Km ${l}` : '-' },
                {
                    title: 'Tiện ích',
                    key: 'facilities',
                    render: (_: any, r: any) => (
                        <Space>
                            {r.HasPetrol && <span style={{ color: 'green' }}>✓ Xăng</span>}
                            {r.HasFood && <span style={{ color: 'blue' }}>✓ Ăn uống</span>}
                            {r.HasToilet && <span style={{ color: 'orange' }}>✓ Vệ sinh</span>}
                        </Space>
                    )
                },
                { title: 'Trạng thái', dataIndex: 'Status' }
            );
        } else if (type === 'bridge') {
            baseColumns.push(
                { title: 'Tên cầu', dataIndex: 'NameBridge', render: (t: string) => <b>{t}</b> },
                { title: 'Chiều dài (m)', dataIndex: 'Length' },
                { title: 'Loại', dataIndex: 'Type' },
                { title: 'Bắc qua', dataIndex: 'Crossing' }
            );
        } else if (type === 'tunnel') {
            baseColumns.push(
                { title: 'Tên hầm', dataIndex: 'NameTunnel', render: (t: string) => <b>{t}</b> },
                { title: 'Chiều dài (m)', dataIndex: 'Length' },
                { title: 'Chiều cao (m)', dataIndex: 'Height' },
                { title: 'Tốc độ (Min-Max)', render: (_: any, r: any) => `${r.MinSpeed || 0} - ${r.MaxSpeed || 0} km/h` }
            );
        }

        baseColumns.push({
            title: 'Thao tác',
            key: 'action',
            width: 140,
            align: 'center',
            render: (_: any, record: any, index: number) => (
                <Space size="small">
                    <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => handleStartEditSubItem(record, index)}>Sửa</Button>
                    <Popconfirm title="Xóa hạ tầng này?" onConfirm={() => handleDeleteSubItemFromState(index)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        });

        return baseColumns;
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
        return `${baseUrl}/${url.replace(/^\//, '')}`;
    };

    if (loading || !sectionId || sectionId === 'undefined') {
        return (
            <ProtectedRoute role={1}>
                <MainLayout>
                    <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>
                </MainLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/manageExpressway')} style={{ marginBottom: 16 }}>Quay lại danh sách</Button>

                    <Card title={`CẬP NHẬT THÔNG TIN: ${sectionData?.NameSection?.toUpperCase() || 'PHÂN ĐOẠN CAO TỐC'}`} style={{ marginBottom: 24, borderRadius: 8 }} extra={<Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={handleSaveAll} size="large">Lưu Tất Cả Thay Đổi</Button>}>
                        <Form form={mainForm} layout="vertical">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                <Form.Item name="NameSection" label="Tên phân đoạn" rules={[{ required: true }]}><Input /></Form.Item>
                                </Col>
                                <Col xs={24} md={6}><Form.Item name="Length" label="Chiều dài toàn tuyến (Km)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="Status" label="Trạng thái hoạt động">
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
                                <Col xs={24} md={6}><Form.Item name="StartLocation" label="Điểm đầu"><Input /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="StartKm" label="Km Bắt đầu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="EndLocation" label="Điểm cuối"><Input /></Form.Item></Col>
                                <Col xs={24} md={6}><Form.Item name="EndKm" label="Km Kết thúc"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={12}><Form.Item name="SpeedLimit" label="Mô tả / Giới hạn tốc độ"><Input.TextArea rows={4} /></Form.Item></Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Hình ảnh biển báo tốc độ (SpeedSign)">
                                        {!isEditingSign ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                {speedSignUrl ? <img src={getImageUrl(speedSignUrl)} alt="Sign" style={{ width: 240, height: 140, objectFit: 'contain' }} /> : <span>Chưa có biển báo</span>}
                                                <Button icon={<EditOutlined />} onClick={() => setIsEditingSign(true)}>Thay đổi biển báo</Button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Upload name="file" listType="picture-card" maxCount={1} beforeUpload={(f) => { setSpeedSignFile(f); return false; }} onRemove={() => setSpeedSignFile(null)}>
                                                    {!speedSignFile && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh mới</div></div>}
                                                </Upload>
                                                <Button type="link" danger onClick={() => { setIsEditingSign(false); setSpeedSignFile(null); }}>Hủy</Button>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>

                    <Card title="QUẢN LÝ HẠ TẦNG KỸ THUẬT" style={{ borderRadius: 8 }}>
                        <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); handleCancelSubEdit(); }} items={[
                            { key: 'interchange', label: `Nút giao (${interchanges.length})` },
                            { key: 'restStop', label: `Trạm dừng nghỉ (${restStops.length})` },
                            { key: 'bridge', label: `Cầu (${bridges.length})` },
                            { key: 'tunnel', label: `Đường hầm (${tunnels.length})` },
                        ]} />

                        {editingSubIndex === null && (
                            <Button type="dashed" icon={<PlusOutlined />} onClick={() => handleStartEditSubItem(null, -1)} style={{ marginBottom: 16 }}>
                                Thêm {activeTab === 'interchange' ? 'Nút giao' : activeTab === 'restStop' ? 'Trạm dừng nghỉ' : activeTab === 'bridge' ? 'Cầu' : 'Hầm'} mới
                            </Button>
                        )}

                        <Table
                            columns={getSubColumns(activeTab)}
                            dataSource={activeTab === 'interchange' ? interchanges : activeTab === 'restStop' ? restStops : activeTab === 'bridge' ? bridges : tunnels}
                            rowKey={(r, i) => r.InterchangeId || r.RestStopId || r.BridgeId || r.TunnelId || r._id || `sub-${i}`}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />

                        {editingSubIndex !== null && (
                            <Card type="inner" title={editingSubIndex >= 0 ? "Cập nhật thông tin hạ tầng" : "Thêm hạ tầng mới"} style={{ marginTop: 24, backgroundColor: '#fafafa' }} extra={<Button icon={<CloseOutlined />} onClick={handleCancelSubEdit}>Hủy</Button>}>
                                <Form form={subForm} layout="vertical">
                                    {activeTab === 'interchange' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}><Form.Item name="NameInterchange" label="Tên nút giao" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Location" label="Vị trí (Km)"><Input placeholder="VD: 182" /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Type" label="Loại nút giao"><Input placeholder="VD: Trumpet" /></Form.Item></Col>
                                            <Col xs={24} md={12}><Form.Item name="Connection" label="Đường kết nối"><Input placeholder="VD: Ring Road 3, AH1" /></Form.Item></Col>
                                            <Col xs={24} md={12}><Form.Item name="Status" label="Trạng thái"><Input placeholder="VD: Complete" /></Form.Item></Col>
                                        </Row>
                                    )}

                                    {activeTab === 'restStop' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}><Form.Item name="NameRestStop" label="Tên trạm dừng" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Location" label="Vị trí (Km)"><Input placeholder="VD: 227.7" /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Status" label="Trạng thái"><Input placeholder="VD: Operating" /></Form.Item></Col>
                                            <Col xs={24} md={24}>
                                                <Form.Item label="Tiện ích trạm">
                                                    <Space size="large">
                                                        <Form.Item name="HasPetrol" valuePropName="checked" noStyle><Checkbox>Cây xăng</Checkbox></Form.Item>
                                                        <Form.Item name="HasFood" valuePropName="checked" noStyle><Checkbox>Khu ăn uống</Checkbox></Form.Item>
                                                        <Form.Item name="HasToilet" valuePropName="checked" noStyle><Checkbox>Nhà vệ sinh</Checkbox></Form.Item>
                                                    </Space>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}

                                    {activeTab === 'bridge' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}><Form.Item name="NameBridge" label="Tên cầu" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Length" label="Chiều dài (m)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Type" label="Loại cầu"><Input placeholder="VD: River bridge" /></Form.Item></Col>
                                            <Col xs={24} md={12}><Form.Item name="Crossing" label="Bắc qua"><Input placeholder="VD: Châu Giang River" /></Form.Item></Col>
                                        </Row>
                                    )}

                                    {activeTab === 'tunnel' && (
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}><Form.Item name="NameTunnel" label="Tên đường hầm" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Length" label="Chiều dài (m)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="Height" label="Chiều cao (m)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="MinSpeed" label="Tốc độ tối thiểu"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                            <Col xs={24} md={6}><Form.Item name="MaxSpeed" label="Tốc độ tối đa"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                                        </Row>
                                    )}

                                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                                        <Space>
                                            <Button onClick={handleCancelSubEdit}>Hủy bỏ</Button>
                                            <Button type="primary" onClick={handleSaveSubItemToState}>Lưu vào danh sách</Button>
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
}
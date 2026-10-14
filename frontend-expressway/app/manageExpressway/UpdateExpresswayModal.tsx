import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axiosClient from '@/api/axiosClient';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const UpdateExpresswayModal: React.FC<UpdateExpresswayModalProps> = ({
    isOpen,
    onClose,
    expresswayData,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && expresswayData) {
            form.setFieldsValue({
                NameExpressway: expresswayData.NameExpressway || '',
                Symbol: expresswayData.Symbol || '',
                Description: expresswayData.Description || '',
            });

            if (expresswayData.MapData) {
                setFileList([
                    {
                        uid: '-1',
                        name: expresswayData.MapData.split('/').pop() || 'MapData.json',
                        status: 'done',
                        url: `${baseUrl}/${expresswayData.MapData}`,
                    },
                ]);
            } else {
                setFileList([]);
            }
        }
    }, [isOpen, expresswayData, form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (values.NameExpressway) formData.append('NameExpressway', values.NameExpressway);
            if (values.Symbol) formData.append('Symbol', values.Symbol);
            if (values.Description) formData.append('Description', values.Description);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('MapData', fileList[0].originFileObj);
            }

            const id = expresswayData.ExpresswayId || expresswayData.id;
            await axiosClient.put(`/expressways/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Cập nhật thông tin cao tốc thành công!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Lỗi khi cập nhật:', error);
            message.error(error?.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`CẬP NHẬT TUYẾN CAO TỐC`}
            open={isOpen}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="NameExpressway"
                    label="Tên Cao Tốc"
                    rules={[{ required: true, message: 'Vui lòng nhập tên tuyến cao tốc!' }]}
                >
                    <Input placeholder="Nhập tên cao tốc (VD: Cao Tốc Bắc Nam...)" />
                </Form.Item>

                <Form.Item name="Symbol" label="Ký Hiệu / Mã Tuyến">
                    <Input placeholder="Mã tuyến (VD: CT.01)" />
                </Form.Item>

                <Form.Item name="Description" label="Mô Tả / Ghi Chú">
                    <Input.TextArea rows={3} placeholder="Mô tả về tuyến cao tốc..." />
                </Form.Item>

                <Form.Item label="File Bản Đồ (.json)">
                    <Upload
                        accept=".json,application/json"
                        maxCount={1}
                        fileList={fileList}
                        beforeUpload={(file) => {
                            const isJson = file.type === 'application/json' || file.name.endsWith('.json');
                            if (!isJson) {
                                message.error('Chỉ cho phép upload file định dạng .json!');
                                return Upload.LIST_IGNORE;
                            }
                            return false;
                        }}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                    >
                        <Button icon={<UploadOutlined />}>Chọn file .json mới</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};
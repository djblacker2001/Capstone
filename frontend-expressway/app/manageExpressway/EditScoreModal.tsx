import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface EditScoreModalProps {
    currentScore: number;
    onScoreChange: (newScore: number) => void;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({ currentScore, onScoreChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleOpen = () => {
        form.setFieldsValue({ score: currentScore });
        setIsModalOpen(true);
    };

    const handleSave = (values: { score: number }) => {
        onScoreChange(values.score);
        setIsModalOpen(false);
        message.success('Cập nhật điểm số thành công!');
    };

    return (
        <>
            <span
                onClick={handleOpen}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '4px' }}
            >
                <EditOutlined style={{ fontSize: '18px', marginRight:'5px' }} />
                Điểm
            </span>

            <Modal
                title="Chỉnh sửa điểm số"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{ score: currentScore }}
                >
                    <Form.Item
                        label="Nhập điểm số mới"
                        name="score"
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm!' },
                            { type: 'number', min: 0, max: 1000, message: 'Điểm từ 0 đến 1000!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số điểm..."
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: '#0A9646' }}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};
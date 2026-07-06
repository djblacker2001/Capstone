"use client";

import { DeleteOutlined, EditOutlined, SafetyCertificateOutlined, SearchOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";
import { useEffect, useState } from "react";
import "./style.css";

interface UserDataType {
    id: number;
    Username: string;
    RoleId: number;
    Avatar?: string;
    CreatedAt?: string;
}

export default function ManageUserPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [allAccounts, setAllAccounts] = useState<UserDataType[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<UserDataType | null>(null);
    const [form] = Form.useForm();

    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('token');

            const response = await axiosClient.get('http://localhost:8080/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data) {
                setAllAccounts(response.data);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách tài khoản:', error);
            message.error('Không thể tải dữ liệu từ server!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAccounts();
    }, []);

    const openModal = (user: UserDataType | null = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue({
                Username: user.Username,
                RoleId: user.RoleId,
                password: '',
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

            if (editingUser) {
                await axiosClient.put(`http://localhost:8080/users/${editingUser.id}`, values);
                message.success('Cập nhật tài khoản thành công!');
            } else {
                await axiosClient.post('http://localhost:8080/users', values);
                message.success('Thêm tài khoản mới thành công!');
            }

            setIsModalOpen(false);
            fetchAllAccounts();
        } catch (error) {
            console.error('Lỗi thao tác:', error);
            message.error('Thao tác thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await axiosClient.delete(`http://localhost:8080/users/${id}`);
            message.success('Đã xóa tài khoản!');
            fetchAllAccounts();
        } catch (error) {
            console.error('Lỗi xóa:', error);
            message.error('Không thể xóa tài khoản này!');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'UserId', 
            key: 'UserId', 
            width: 80 
        },
        {
            title: 'Username',
            dataIndex: 'Username',
            key: 'Username',
            render: (text: string, record: UserDataType) => (
                <Space>
                    {record.RoleId === 1 ? <SafetyCertificateOutlined style={{ color: '#ff4d4f' }} /> : <UserOutlined />}
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
        },
        {
            title: 'Phân loại',
            dataIndex: 'RoleId',
            key: 'RoleId',
            width: 150,
            render: (roleId: number) => roleId === 1 ? <Tag color="red">ADMIN (Bảng riêng)</Tag> : <Tag color="blue">USER (Bảng riêng)</Tag>
        },
    ];

    const filteredAdmins = allAccounts.filter(acc => acc.RoleId === 1 && acc.Username?.toLowerCase().includes(searchText.toLowerCase()));
    const filteredUsers = allAccounts.filter(acc => acc.RoleId === 2 && acc.Username?.toLowerCase().includes(searchText.toLowerCase()));
    const tabItems = [
        {
            key: '1',
            label: <span style={{ fontWeight: 'bold' }}>👤 Danh sách Người dùng (Table: users)</span>,
            children: <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} bordered />,
        },
        {
            key: '2',
            label: <span style={{ fontWeight: 'bold' }}>🛡️ Danh sách Quản trị viên (Table: admins)</span>,
            children: <Table columns={columns} dataSource={filteredAdmins} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} bordered />,
        },
    ];
    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    <Card
                        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>⚙️ Trung tâm quản trị cơ sở dữ liệu tài khoản</span>}
                        extra={
                            <Button
                                type="primary" icon={<UserAddOutlined />} onClick={() => openModal(null)}
                                style={{ background: '#059731', borderColor: '#059731' }}
                            >
                                Cấp tài khoản mới
                            </Button>
                        }
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <Input
                                placeholder="Tìm kiếm tài khoản nhanh..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                        </div>
                        <Tabs defaultActiveKey="1" items={tabItems} type="card" />
                    </Card>

                    <Modal
                        title={editingUser ? '✏️ Hiệu chỉnh tài khoản' : '➕ Tạo tài khoản phân vùng mới'}
                        open={isModalOpen}
                        onOk={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        okText="Xác nhận lưu" cancelText="Hủy bỏ" confirmLoading={loading}
                    >
                        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                            <Form.Item
                                name="Username" label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng điền tên đăng nhập!' }]}
                            >
                                <Input placeholder="Nhập tên tài khoản" disabled={!!editingUser} />
                            </Form.Item>

                            <Form.Item
                                name="password" label={editingUser ? "Mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu khởi tạo"}
                                rules={[{ required: !editingUser, message: 'Vui lòng điền mật khẩu!' }]}
                            >
                                <Input.Password placeholder="Nhập mã bảo mật" />
                            </Form.Item>

                            <Form.Item
                                name="RoleId" label="Đích lưu trữ (Hệ thống tự phân bảng)"
                                rules={[{ required: true, message: 'Vui lòng chọn đích lưu trữ!' }]}
                            >
                                <Select
                                    placeholder="Chọn bảng đích ghi dữ liệu"
                                    disabled={!!editingUser}
                                    options={[
                                        { value: 2, label: 'Lưu vào bảng [users]' },
                                        { value: 1, label: 'Lưu vào bảng [admins]' },
                                    ]}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </MainLayout>
        </ProtectedRoute>
    )
}

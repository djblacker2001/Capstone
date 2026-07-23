"use client";

import { DeleteOutlined, EditOutlined, SafetyCertificateOutlined, SearchOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";
import { useEffect, useState } from "react";

interface UserDataType {
    UserId: number;
    Username: string;
    Email?: string;
    RoleId: number;
    Avatar?: string;
    CreatedAt?: string;
}

export default function ManageUserPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [allAccounts, setAllAccounts] = useState<UserDataType[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<UserDataType | null>(null);
    const [form] = Form.useForm();

    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const response: any = await axiosClient.get("/users");
            
            const resData = response?.data || response;
            if (Array.isArray(resData)) {
                setAllAccounts(resData);
            } else if (resData?.data && Array.isArray(resData.data)) {
                setAllAccounts(resData.data);
            } else {
                setAllAccounts([]);
            }
        } catch (error: any) {
            console.error("Lỗi lấy danh sách tài khoản:", error);
            message.error("Không thể tải danh sách tài khoản từ Server!");
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
                password: "",
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
                const updatePayload = { ...values };
                if (!updatePayload.password) {
                    delete updatePayload.password;
                }

                await axiosClient.put(`/users/${editingUser.UserId}`, updatePayload);
                message.success("Cập nhật tài khoản thành công!");
            } else {
                await axiosClient.post("/users", values);
                message.success("Thêm tài khoản mới thành công!");
            }

            setIsModalOpen(false);
            form.resetFields();
            fetchAllAccounts();
        } catch (error: any) {
            console.error("Lỗi thao tác:", error);
            const errMsg = error.response?.data?.message || "Thao tác thất bại, vui lòng kiểm tra lại!";
            message.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình các cột cho Bảng
    const columns = [
        { 
            title: "ID", 
            dataIndex: "UserId", 
            key: "UserId", 
            width: 80,
            sorter: (a: UserDataType, b: UserDataType) => a.UserId - b.UserId,
        },
        {
            title: "Username",
            dataIndex: "Username",
            key: "Username",
            render: (text: string, record: UserDataType) => (
                <Space>
                    {record.RoleId === 1 ? (
                        <SafetyCertificateOutlined style={{ color: "#ff4d4f" }} />
                    ) : (
                        <UserOutlined style={{ color: "#1890ff" }} />
                    )}
                    <span style={{ fontWeight: 600 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: "Email",
            dataIndex: "Email",
            key: "Email",
            render: (email: string) => email || <i style={{ color: "#8c8c8c" }}>Chưa cập nhật</i>,
        },
        {
            title: "Phân loại",
            dataIndex: "RoleId",
            key: "RoleId",
            width: 180,
            render: (roleId: number) => 
                roleId === 1 ? (
                    <Tag color="red">ADMIN (Bảng admins)</Tag>
                ) : (
                    <Tag color="blue">USER (Bảng users)</Tag>
                ),
        },
    ];

    // Lọc theo tìm kiếm
    const filteredUsers = allAccounts.filter(
        (acc) => acc.RoleId === 2 && acc.Username?.toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredAdmins = allAccounts.filter(
        (acc) => acc.RoleId === 1 && acc.Username?.toLowerCase().includes(searchText.toLowerCase())
    );

    const tabItems = [
        {
            key: "1",
            label: <span style={{ fontWeight: "bold" }}>👤 Danh sách Người dùng (Table: users)</span>,
            children: (
                <Table 
                    columns={columns} 
                    dataSource={filteredUsers} 
                    rowKey="UserId" 
                    loading={loading} 
                    pagination={{ pageSize: 6 }} 
                    bordered 
                />
            ),
        },
        {
            key: "2",
            label: <span style={{ fontWeight: "bold" }}>🛡️ Danh sách Quản trị viên (Table: admins)</span>,
            children: (
                <Table 
                    columns={columns} 
                    dataSource={filteredAdmins} 
                    rowKey="UserId" 
                    loading={loading} 
                    pagination={{ pageSize: 6 }} 
                    bordered 
                />
            ),
        },
    ];

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                    <Card title={<span style={{ fontSize: "20px", fontWeight: "bold" }}>⚙️ Trung tâm quản trị cơ sở dữ liệu tài khoản</span>}>
                        <div style={{ marginBottom: "20px" }}>
                            <Input
                                placeholder="Tìm kiếm tài khoản nhanh..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 320 }}
                                allowClear
                            />
                        </div>
                        <Tabs defaultActiveKey="1" items={tabItems} type="card" />
                    </Card>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
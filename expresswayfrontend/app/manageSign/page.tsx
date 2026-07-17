"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";
import { useEffect, useState } from "react";

interface SignDataType {
    SignId: number;
    Symbol: string;
    Image: string;
    Description: string;
}

export default function ManageSignPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [signs, setSigns] = useState<SignDataType[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSign, setEditingSign] = useState<SignDataType | null>(null);
    const [form] = Form.useForm();

    const fetchSigns = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/signs");
            console.log("Dữ liệu API Signs trả về:", response.data);
            if (response.data) {
                if (response.data.success && response.data.data) {
                    setSigns(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setSigns(response.data);
                } else if (Array.isArray(response.data.data)) {
                    setSigns(response.data.data);
                } else {
                    message.error("Cấu trúc JSON từ server không khớp với mã nguồn Front-end!");
                }
            }
        } catch (error: any) {
            console.error("Lỗi chi tiết khi gọi API signs:", error);

            const statusCode = error.response?.status;
            message.error(`Không thể kết nối đến server! (Mã lỗi: ${statusCode || "Đứt kết nối"})`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSigns();
    }, []);

    // Mở Modal Form
    const openModal = (sign: SignDataType | null = null) => {
        setEditingSign(sign);
        if (sign) {
            form.setFieldsValue({
                Symbol: sign.Symbol,
                Image: sign.Image,
                Description: sign.Description,
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

            if (editingSign) {
                await axiosClient.put(`http://localhost:8080/signs/${editingSign.SignId}`, values);
                message.success("Cập nhật thông tin biển báo thành công!");
            } else {
                await axiosClient.post("http://localhost:8080/signs", values);
                message.success("Thêm biển báo mới thành công!");
            }

            setIsModalOpen(false);
            fetchSigns();
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            message.error("Thao tác thất bại, vui lòng kiểm tra dữ liệu đầu vào!");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSign = async (signId: number) => {
        try {
            setLoading(true);
            await axiosClient.delete(`http://localhost:8080/signs/${signId}`);
            message.success("Đã xóa biển báo thành công khỏi hệ thống!");
            fetchSigns();
        } catch (error) {
            console.error("Lỗi xóa biển báo:", error);
            message.error("Không thể xóa biển báo này!");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã số (SignId)",
            dataIndex: "SignId",
            key: "SignId",
            width: 130,
            sorter: (a: SignDataType, b: SignDataType) => a.SignId - b.SignId,
        },
        {
            title: "Hình ảnh",
            dataIndex: "Image",
            key: "Image",
            width: 120,
            align: "center" as const,
            render: (imgStr: string) => {
                const srcUrl = imgStr?.startsWith("http") ? imgStr : `http://localhost:8080/${imgStr}`;
                const AntdImage = require("antd").Image;
                return (
                    <AntdImage
                        src={srcUrl}
                        alt="sign-icon"
                        width={50}
                        height={50}
                        style={{ objectFit: "contain", borderRadius: "4px" }}
                        fallback="/expresswayicon.png"
                    />
                );
            },
        },
        {
            title: "Ký hiệu (Symbol)",
            dataIndex: "Symbol",
            key: "Symbol",
            width: 150,
            render: (text: string) => <strong style={{ color: "#1890ff" }}>{text}</strong>,
        },
        {
            title: "Mô tả ý nghĩa",
            dataIndex: "Description",
            key: "Description",
            ellipsis: true,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 200,
            render: (_: any, record: SignDataType) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa biển báo"
                        description="Bạn có chắc chắn muốn xóa biển báo này không?"
                        onConfirm={() => handleDeleteSign(record.SignId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Tìm kiếm tại chỗ (Front-end Filter)
    const filteredSigns = signs.filter((sign) => {
        return (
            sign.Symbol?.toLowerCase().includes(searchText.toLowerCase()) ||
            sign.Description?.toLowerCase().includes(searchText.toLowerCase())
        );
    });
    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                    <Card
                        title={<span style={{ fontSize: "20px", fontWeight: "bold" }}>🛑 Quản lý danh mục biển báo cao tốc</span>}
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openModal(null)}
                                style={{ background: "#059731", borderColor: "#059731" }}
                            >
                                Thêm biển báo mới
                            </Button>
                        }
                    >
                        <div style={{ marginBottom: "20px" }}>
                            <Input
                                placeholder="Tìm kiếm theo mã ký hiệu hoặc mô tả..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 350 }}
                                allowClear
                            />
                        </div>

                        <Table
                            columns={columns}
                            dataSource={filteredSigns}
                            rowKey="SignId" // Khóa chính để AntD định danh hàng
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />
                    </Card>

                    {/* MODAL FORM THÊM / SỬA */}
                    <Modal
                        title={editingSign ? "✏️ Cập nhật thông tin biển báo" : "➕ Thêm biển báo mới vào hệ thống"}
                        open={isModalOpen}
                        onOk={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        okText={editingSign ? "Lưu thay đổi" : "Tạo mới"}
                        cancelText="Hủy"
                        confirmLoading={loading}
                    >
                        <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
                            <Form.Item
                                name="Symbol"
                                label="Ký hiệu biển báo (Symbol)"
                                rules={[{ required: true, message: "Vui lòng nhập ký hiệu biển báo!" }]}
                            >
                                <Input placeholder="Ví dụ: IE.450a" />
                            </Form.Item>

                            <Form.Item
                                name="Image"
                                label="Đường dẫn hình ảnh (Image Path)"
                                rules={[{ required: true, message: "Vui lòng nhập đường dẫn ảnh!" }]}
                            >
                                <Input placeholder="Ví dụ: uploads/signs/IE450a.png" />
                            </Form.Item>

                            <Form.Item
                                name="Description"
                                label="Mô tả nội dung / Ý nghĩa"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung giải thích biển báo!" }]}
                            >
                                <Input.TextArea rows={4} placeholder="Nhập ý nghĩa chi tiết hiển thị..." />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </MainLayout>
        </ProtectedRoute>
    )
}
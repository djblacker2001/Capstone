"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Space, Table, Upload, Image as AntdImage, Select } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axiosClient from "@/api/axiosClient";

interface SignDataType {
    SignId: number;
    Symbol: string;
    Image: string;
    Description: string;
    SignTypeId?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function ManageSignPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [signs, setSigns] = useState<SignDataType[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSign, setEditingSign] = useState<SignDataType | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    const fetchSigns = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/signs");
            const resData = response.data;

            if (Array.isArray(resData)) {
                setSigns(resData);
            } else if (resData?.data && Array.isArray(resData.data)) {
                setSigns(resData.data);
            } else if (resData?.success && Array.isArray(resData.data)) {
                setSigns(resData.data);
            } else {
                setSigns([]);
            }
        } catch (error: any) {
            console.error("Lỗi khi tải danh sách:", error);
            message.error("Không thể tải danh sách biển báo!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSigns();
    }, []);

    const openModal = (sign: SignDataType | null = null) => {
        setEditingSign(sign);

        if (sign) {
            form.setFieldsValue({
                Symbol: sign.Symbol,
                SignTypeId: sign.SignTypeId,
                Description: sign.Description,
            });

            if (sign.Image) {
                const imageUrl = sign.Image.startsWith("http")
                    ? sign.Image
                    : `${baseUrl}/${sign.Image}`;

                setFileList([
                    {
                        uid: "-1",
                        name: "Ảnh hiện tại",
                        status: "done",
                        url: imageUrl,
                    },
                ]);
            } else {
                setFileList([]);
            }
        } else {
            form.resetFields();
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const formData = new FormData();

            if (values.Symbol) formData.append("Symbol", values.Symbol);
            if (values.SignTypeId) formData.append("SignTypeId", values.SignTypeId);
            if (values.Description) formData.append("Description", values.Description);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("file", fileList[0].originFileObj);
            }

            if (editingSign) {
                await axiosClient.put(`/signs/${editingSign.SignId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Cập nhật biển báo thành công!");
            } else {
                await axiosClient.post("/signs", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Thêm biển báo mới thành công!");
            }

            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
            fetchSigns();
        } catch (error: any) {
            console.error("Lỗi lưu dữ liệu:", error);
            const errMsg = error.response?.data?.message || "Thao tác thất bại, kiểm tra lại!";
            message.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSign = async (signId: number) => {
        try {
            setLoading(true);
            await axiosClient.delete(`/signs/${signId}`);
            message.success("Đã xóa biển báo khỏi hệ thống!");
            fetchSigns();
        } catch (error: any) {
            console.error("Lỗi xóa biển báo:", error);
            message.error("Không thể xóa biển báo này!");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        
        {
            title: "Hình ảnh",
            dataIndex: "Image",
            key: "Image",
            width: 110,
            align: "center" as const,
            render: (imgStr: string) => {
                const srcUrl = imgStr?.startsWith("http") ? imgStr : `${baseUrl}/${imgStr}`;
                return (
                    <AntdImage
                        src={srcUrl}
                        alt="sign-icon"
                        width={45}
                        height={45}
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
            width: 160,
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
            width: 180,
            align: "center" as const,
            render: (_: any, record: SignDataType) => (
                <Space size="small">
                    <Button
                        type="primary"
                        ghost
                        size="small"
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
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredSigns = signs.filter((sign) => {
        const query = searchText.toLowerCase();
        return (
            sign.Symbol?.toLowerCase().includes(query) ||
            sign.Description?.toLowerCase().includes(query)
        );
    });

    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                    <Card
                        title={<span style={{ fontSize: "20px", fontWeight: "bold" }}>Quản lý danh mục biển báo cao tốc</span>}
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
                            rowKey="SignId"
                            loading={loading}
                            pagination={{ pageSize: 6 }}
                            bordered
                        />
                    </Card>

                    <Modal
                        title={editingSign ? "Cập nhật thông tin biển báo" : "Thêm biển báo mới vào hệ thống"}
                        open={isModalOpen}
                        onOk={handleFormSubmit}
                        onCancel={() => setIsModalOpen(false)}
                        okText={editingSign ? "Lưu thay đổi" : "Tạo mới"}
                        cancelText="Hủy"
                        confirmLoading={loading}
                        destroyOnClose
                    >
                        <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
                            <Form.Item
                                name="Symbol"
                                label="Ký hiệu biển báo (Symbol)"
                                rules={[{ required: true, message: "Vui lòng nhập ký hiệu biển báo!" }]}
                            >
                                <Input placeholder="Ví dụ: IE.450a, P.101, W.201..." />
                            </Form.Item>

                            <Form.Item
                                name="SignTypeId"
                                label="Loại biển báo"
                                rules={[{ required: true, message: "Vui lòng chọn loại biển báo!" }]}
                            >
                                <Select placeholder="-- Chọn nhóm loại biển báo --">
                                    <Select.Option value={1}>Biển báo cấm</Select.Option>
                                    <Select.Option value={2}>Biển báo nguy hiểm và cảnh báo</Select.Option>
                                    <Select.Option value={3}>Biển báo hiệu lệnh</Select.Option>
                                    <Select.Option value={4}>Biển chỉ dẫn</Select.Option>
                                    <Select.Option value={5}>Biển chỉ dẫn trên đường cao tốc</Select.Option>
                                    <Select.Option value={6}>Biển phụ</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Hình ảnh biển báo">
                                <Upload
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    listType="picture"
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {editingSign ? "Chọn ảnh mới (Nếu muốn thay)" : "Tải ảnh lên"}
                                    </Button>
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="Description"
                                label="Mô tả nội dung / Ý nghĩa"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung giải thích!" }]}
                            >
                                <Input.TextArea rows={4} placeholder="Nhập ý nghĩa chi tiết hiển thị..." />
                            </Form.Item>

                        </Form>
                    </Modal>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
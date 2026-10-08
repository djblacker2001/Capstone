'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, message, Popconfirm, Image, Spin, Card, Space, Empty, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined, ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface ManageHeroImagesModalProps {
    open: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ManageHeroImagesModal({ open, onClose, onRefresh }: ManageHeroImagesModalProps) {
    const [fileList, setFileList] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${baseUrl}/uploads`);
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                const savedOrder = localStorage.getItem('hero_images_order');
                if (savedOrder) {
                    const parsedOrder: string[] = JSON.parse(savedOrder);
                    const orderedList = parsedOrder.filter((name) => result.data.includes(name));
                    const newImages = result.data.filter((name: string) => !orderedList.includes(name));
                    setFileList([...orderedList, ...newImages]);
                } else {
                    setFileList(result.data);
                }
            } else {
                setFileList([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách ảnh:", error);
            message.error("Không thể tải danh sách ảnh nền!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchImages();
        }
    }, [open]);
    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fileList.length) return;

        const updatedList = [...fileList];
        const [movedItem] = updatedList.splice(index, 1);
        updatedList.splice(newIndex, 0, movedItem);

        setFileList(updatedList);
    };

    const handleSaveOrder = () => {
        localStorage.setItem('hero_images_order', JSON.stringify(fileList));
        message.success('Đã lưu thứ tự hiển thị ảnh!');
        if (onRefresh) onRefresh();
        onClose();
    };

    const handleUpload: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/uploads`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok && (result.success || result.statusCode === 200)) {
                message.success('Tải ảnh lên thành công!');
                onSuccess?.('ok');
                fetchImages();
                if (onRefresh) onRefresh();
            } else {
                throw new Error(result.message || 'Thêm ảnh thất bại');
            }
        } catch (err: any) {
            console.error("Lỗi Upload:", err);
            message.error(err.message || 'Lỗi khi tải ảnh lên');
            onError?.(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/uploads/images/${filename}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const result = await res.json();

            if (res.ok && (result.success || result.statusCode === 200)) {
                message.success(`Đã xóa ảnh ${filename}`);
                const savedOrder = localStorage.getItem('hero_images_order');
                if (savedOrder) {
                    const parsedOrder: string[] = JSON.parse(savedOrder);
                    const updatedOrder = parsedOrder.filter((name) => name !== filename);
                    localStorage.setItem('hero_images_order', JSON.stringify(updatedOrder));
                }

                fetchImages();
                if (onRefresh) onRefresh();
            } else {
                message.error(result.message || 'Xóa ảnh thất bại');
            }
        } catch (error) {
            console.error("Lỗi xóa ảnh:", error);
            message.error('Lỗi kết nối server khi xóa ảnh');
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <PictureOutlined />
                    <span>Quản lý & Sắp xếp ảnh Banner</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSaveOrder}>
                    Lưu Thứ Tự Hiển Thị
                </Button>
            ]}
            width={780}
        >
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Upload customRequest={handleUpload} showUploadList={false} accept="image/*">
                    <Button type="primary" icon={<PlusOutlined />} loading={uploading}>
                        Tải ảnh mới lên
                    </Button>
                </Upload>
                <small style={{ color: '#8c8c8c' }}>
                    * Dùng các nút mũi tên để thay đổi thứ tự xuất hiện trên Carousel
                </small>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : fileList.length === 0 ? (
                <Empty description="Chưa có ảnh nào được tải lên" />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>
                    {fileList.map((filename, index) => {
                        const imageUrl = `${baseUrl}/uploads/images/${filename}`;
                        return (
                            <Card
                                key={filename}
                                hoverable
                                bodyStyle={{ padding: 8 }}
                                cover={
                                    <div style={{ position: 'relative' }}>
                                        <Image
                                            alt={filename}
                                            src={imageUrl}
                                            height={120}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 'bold' }}>
                                            #{index + 1}
                                        </div>
                                    </div>
                                }
                            >
                                {/* Điều khiển vị trí */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space size={2}>
                                        <Tooltip title="Mover sang trái / Trước">
                                            <Button
                                                size="small"
                                                icon={<ArrowLeftOutlined />}
                                                disabled={index === 0}
                                                onClick={() => moveImage(index, 'left')}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Mover sang phải / Sau">
                                            <Button
                                                size="small"
                                                icon={<ArrowRightOutlined />}
                                                disabled={index === fileList.length - 1}
                                                onClick={() => moveImage(index, 'right')}
                                            />
                                        </Tooltip>
                                    </Space>

                                    <Popconfirm
                                        title="Xóa ảnh này?"
                                        description="Xóa vĩnh viễn ảnh khỏi hệ thống?"
                                        onConfirm={() => handleDelete(filename)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                    </Popconfirm>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}
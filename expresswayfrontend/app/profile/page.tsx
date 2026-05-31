'use client';
import { useState, useEffect } from 'react';
import { Upload, Button, Input, message, Divider } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import "./style.css"
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MainLayout from '../layout/Layout';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Hàm xử lý khi chọn file (Chưa upload ngay, chỉ hiện Preview)
    const handleBeforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên định dạng JPG/PNG!');
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);

        // Lưu file vào state để dành cho lúc bấm nút Lưu
        setFileList([file]);
        return false;
    };

    const handleSaveProfile = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn ảnh trước khi lưu!");
            return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);

        setUploading(true);
        try {
            const res = await fetch(`http://localhost:8080/users/${user.UserId}/avatar`, {
                method: 'PATCH',
                body: formData,
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // 1. Cập nhật LocalStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // 2. Bắn tín hiệu để Header cập nhật ảnh ngay lập tức
                window.dispatchEvent(new Event("userUpdate"));
                message.success('Đã lưu ảnh đại diện thành công!');
                // 3. Chuyển về trang chủ
                router.push('/');
            } else {
                message.error('Lưu ảnh thất bại.');
            }
        } catch (error) {
            message.error('Lỗi kết nối server.');
        } finally {
            setUploading(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: 100 }}>Đang tải...</div>;

    return (
        <ProtectedRoute>
            <MainLayout>
                <div className="expr">
                <div className="form">
                    <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Hồ sơ cá nhân</h2>
                    <Divider />

                    <div style={{ textAlign: 'center', marginBottom: 30 }}>
                        <Upload
                            showUploadList={false}
                            beforeUpload={handleBeforeUpload}
                            accept="image/*"
                        >
                            <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                                <img
                                    className="avatar"
                                    src={previewImage || (user.Avatar ? `http://localhost:8080/${user.Avatar}` : '/default-avatar.png')}
                                    alt="avatar"
                                />
                            </div>
                        </Upload>
                        <p style={{ color: '#8c8c8c', marginTop: 15 }}>Click vào ảnh để chọn hình mới</p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Tên đăng nhập:</label>
                        <Input value={user.Username} disabled prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Email:</label>
                        <Input value={user.Email} disabled />
                    </div>

                    <div className="button" style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            size="large"
                            style={{ flex: 1 }}
                            onClick={handleSaveProfile}
                            loading={uploading}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button size="large" style={{ flex: 1 }} onClick={() => router.push('/')}>
                            Hủy bỏ
                        </Button>
                    </div>
                </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
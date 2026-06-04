'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, message, Divider, Tabs } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import "./style.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MainLayout from '../layout/Layout';

const SettingPage = () => {
    const router = useRouter();
    const [formInfo] = Form.useForm();
    const [formPassword] = Form.useForm();

    const [user, setUser] = useState<any>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState('');
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // 1. Lấy thông tin user hiện tại từ localStorage khi tải trang
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            // 1. Điền thông tin text vào Form
            formInfo.setFieldsValue({
                username: parsedUser.Username || parsedUser.username,
                email: parsedUser.Email || parsedUser.email,
            });

            // 2. 🔥 BỔ SUNG: Kiểm tra xem user đã từng có avatar chưa để set làm ảnh hiển thị mặc định
            const currentAvatar = parsedUser.Avatar || parsedUser.avatar;
            if (currentAvatar) {
                // Tự động xử lý chuỗi path tương tự như bên Header để không bị lỗi vỡ ảnh
                const fullAvatarUrl = currentAvatar.startsWith('http')
                    ? currentAvatar
                    : currentAvatar.includes('uploads/avatars')
                        ? `http://localhost:8080/${currentAvatar}`
                        : `http://localhost:8080/uploads/avatars/${currentAvatar}`;

                setPreviewImage(fullAvatarUrl); // Đưa ảnh cũ làm ảnh preview ban đầu
            }
        }
    }, [formInfo]);

    // 2. Xử lý khi chọn ảnh đại diện mới (Client-side Preview)
    const handleBeforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên định dạng JPG/PNG!');
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            setPreviewImage(e.target.result); // Tạo link ảnh tạm thời để xem trước công việc
        };
        reader.readAsDataURL(file);
        setFileList([file]);
        return false; // Ngăn Antd tự động upload trực tiếp luôn
    };

    // 3. API xử lý cập nhật Thông tin cá nhân & Avatar
    const onUpdateInfo = async (values: any) => {
        setLoadingInfo(true);
        try {
            const formData = new FormData();
            formData.append('username', values.username);
            formData.append('email', values.email);

            if (fileList.length > 0) {
                // 🔥 CHỈNH SỬA 1: Đổi chữ 'file' thành 'avatar' cho khớp với FileInterceptor('avatar')
                formData.append('avatar', fileList[0]);
            }

            // 🔥 CHỈNH SỬA 2: Đổi URL thành /users/profile theo đúng định tuyến Backend của bạn
            const res = await fetch(`http://localhost:8080/users/profile`, {
                method: 'PUT', // Giữ nguyên PUT khớp với @Put('profile')
                headers: {
                    // Bắt buộc truyền Token vì Backend có @UseGuards(JwtAuthGuard)
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // TUYỆT ĐỐI KHÔNG set Content-Type ở đây nha
                },
                body: formData,
            });

            if (res.ok) {
                const responseJson = await res.json();
                const updatedUser = responseJson.data;

                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                // 🟢 SỬA TẠI ĐÂY: Sau khi up thành công, không clear preview nữa mà cập nhật đường dẫn ảnh mới luôn
                const newAvatar = updatedUser.Avatar || updatedUser.avatar;
                if (newAvatar) {
                    const fullAvatarUrl = newAvatar.startsWith('http')
                        ? newAvatar
                        : newAvatar.includes('uploads/avatars')
                            ? `http://localhost:8080/${newAvatar}`
                            : `http://localhost:8080/uploads/avatars/${newAvatar}`;
                    setPreviewImage(fullAvatarUrl);
                }

                setFileList([]); // Chỉ clear mảng file thô để chuẩn bị cho lần chọn tiếp theo

                window.dispatchEvent(new Event("userUpdate"));
                message.success('Cập nhật thông tin cá nhân thành công!');
            } else {
                message.error('Cập nhật thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoadingInfo(false);
        }
    };

    // 4. API xử lý Đổi mật khẩu
    const onChangePassword = async (values: any) => {
        setLoadingPassword(false);
        try {
            const res = await fetch(`http://localhost:8080/users/${user.UserId}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (res.ok) {
                message.success('Đổi mật khẩu thành công!');
                formPassword.resetFields(); // Xóa sạch dữ liệu trên form mật khẩu sau khi đổi xong
            } else {
                const errData = await res.json();
                message.error(errData.message || 'Mật khẩu cũ không chính xác.');
            }
        } catch (error) {
            message.error('Lỗi kết nối khi đổi mật khẩu.');
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: 100 }}>Đang tải...</div>;

    // Cấu trúc danh mục tab của Ant Design
    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            children: (
                <Form form={formInfo} layout="vertical" onFinish={onUpdateInfo}>
                    {/* Khu vực Avatar */}
                    <div style={{ textAlign: 'center', marginBottom: 25 }}>
                        <Avatar
                            size={100}
                            icon={<UserOutlined />}
                            src={previewImage || (user.Avatar ? `http://localhost:8080/${user.Avatar}` : undefined)}
                            style={{ border: '1px solid #d9d9d9', marginBottom: 15 }}
                        />
                        <div style={{ display: 'block' }}>
                            <Upload
                                beforeUpload={handleBeforeUpload}
                                showUploadList={false}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                            </Upload>
                        </div>
                    </div>

                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập username" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loadingInfo} block size="large" style={{ marginTop: 10 }}>
                        Lưu thông tin
                    </Button>
                </Form>
            )
        },
        {
            key: '2',
            label: 'Đổi mật khẩu',
            children: (
                <Form form={formPassword} layout="vertical" onFinish={onChangePassword}>
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="oldPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu cũ" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận lại mật khẩu mới" />
                    </Form.Item>

                    <Button type="primary" danger htmlType="submit" loading={loadingPassword} block size="large" style={{ marginTop: 10 }}>
                        Đổi mật khẩu
                    </Button>
                </Form>
            )
        }
    ];

    return (
        <ProtectedRoute>
            <MainLayout>
                <div className="expr">
                    <div className="form" style={{ maxWidth: 500, margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Cài đặt tài khoản</h2>
                        <Divider style={{ margin: '12px 0' }} />
                        <Tabs defaultActiveKey="1" items={tabItems} centered />
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    )
}

export default SettingPage;
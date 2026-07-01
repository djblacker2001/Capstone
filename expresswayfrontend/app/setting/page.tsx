'use client';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, message, Divider, Tabs } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import "./setting.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Header from "../components/Header/Header";

export default function SettingPage() {
    const router = useRouter();
    const [formInfo] = Form.useForm();
    const [formPassword] = Form.useForm();

    const [user, setUser] = useState<any>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState('');
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            formInfo.setFieldsValue({
                username: parsedUser.Username || parsedUser.username,
                email: parsedUser.Email || parsedUser.email,
            });

            const currentAvatar = parsedUser.Avatar || parsedUser.avatar;
            if (currentAvatar) {
                const fullAvatarUrl = currentAvatar.startsWith('http')
                    ? currentAvatar
                    : currentAvatar.includes('uploads/avatars')
                        ? `http://localhost:8080/${currentAvatar}`
                        : `http://localhost:8080/uploads/avatars/${currentAvatar}`;

                setPreviewImage(fullAvatarUrl);
            }
        }
    }, [formInfo]);

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
        setFileList([file]);
        return false;
    };

    const onUpdateInfo = async (values: any) => {
        setLoadingInfo(true);
        try {
            const formData = new FormData();
            const finalUsername = values.username || user?.Username || user?.username;
            const finalEmail = values.email || user?.Email || user?.email;

            formData.append('username', finalUsername);
            formData.append('email', finalEmail);

            if (fileList.length > 0) {
                formData.append('avatar', fileList[0]);
            }

            const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('token');

            if (!token || token === "undefined") {
                message.error("Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!");
                setLoadingInfo(false);
                return;
            }

            const res = await fetch(`http://localhost:8080/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                const responseJson = await res.json();
                const newToken = responseJson.accessToken;
                if (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    localStorage.setItem('access_token', newToken);
                    localStorage.setItem('token', newToken);
                }

                const mergedUser = {
                    ...user,
                    Username: responseJson.Username || user?.Username,
                    Email: responseJson.Email || user?.Email,
                    Avatar: responseJson.Avatar || user?.Avatar,
                    Role: responseJson.Role || user?.Role
                };

                localStorage.setItem('user', JSON.stringify(mergedUser));
                setUser(mergedUser);
                setFileList([]);

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event("userUpdate"));
                }
                message.success('Cập nhật thông tin cá nhân thành công!');
                setTimeout(() => {
                    router.push('/profile');
                }, 500);
            } else {
                const errorData = await res.json().catch(() => ({}));
                message.error(errorData.message || 'Cập nhật thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error("Lỗi kết nối update:", error);
            message.error('Lỗi kết nối đến máy chủ.');
        } finally {
            setLoadingInfo(false);
        }
    };

    const onChangePassword = async (values: any) => {
        setLoadingPassword(true);
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('token');

            const res = await fetch(`http://localhost:8080/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                }),
            });

            if (res.ok) {
                message.success('Đổi mật khẩu thành công!');
                formPassword.resetFields();
                setTimeout(() => {
                    router.push('/');
                }, 800);
            } else {
                const errData = await res.json().catch(() => ({}));
                message.error(errData.message || 'Mật khẩu cũ không chính xác.');
            }
        } catch (error) {
            message.error('Lỗi kết nối khi đổi mật khẩu.');
        } finally {
            setLoadingPassword(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: 100 }}>Đang tải...</div>;

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            children: (
                <Form form={formInfo} layout="vertical" onFinish={onUpdateInfo}>
                    <div style={{ textAlign: 'center', marginBottom: 25 }}>
                        <Avatar
                            size={100}
                            icon={<UserOutlined />}
                            src={previewImage || undefined}
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
                        rules={[{ required: true, message: 'Tên đăng nhập không được để trống!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập username" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Email không được để trống!' },
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
            <Header />
            <div className="expr">
                <div className="form" style={{ maxWidth: 500, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Cài đặt tài khoản</h2>
                    <Divider style={{ margin: '12px 0' }} />

                    <Tabs defaultActiveKey="1" items={tabItems} centered />
                </div>
            </div>
        </ProtectedRoute>
    );
}
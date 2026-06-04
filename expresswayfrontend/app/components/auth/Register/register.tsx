'use client';

import { Form, Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './register.css';

const RegisterPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (values.Password !== values.confirm) {
                message.error('Password not match.');
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: values.Username,
                    Email: values.Email,
                    Password: values.Password,
                    Role: values.Role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.message || 'Registration failed');
                return;
            }

            // Để thời gian hiển thị thông báo lâu hơn một chút giúp người dùng đọc kỹ yêu cầu kích hoạt email
            message.success('Registration successful! Please check your email to activate your account.', 6);
            router.push('/login');

        } catch (err) {
            console.error(err);
            message.error('Server Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* 🟢 THAY ĐỔI QUYẾT ĐỊNH: Bọc class cha 'register-page-wrapper' và đưa ảnh nền vào style trực tiếp.
           Khi người dùng chuyển sang trang login hoặc quay lại trang chủ, khung này bị hủy, 
           ảnh nền cao tốc sẽ tự gỡ khỏi DOM 100% không lo bị lỗi giao diện! */
        <div className='register-page-wrapper' style={{
            backgroundImage: "url('/backgroundlogin.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            width: "100%",
            minHeight: "100vh"
        }}>
            <div className='expr'>
                <Form onFinish={onFinish} layout="vertical" scrollToFirstError>
                    <div className='logo'>
                        <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                    </div>
                    <h1><b>Register</b></h1>

                    <Form.Item label="Username" name="Username" rules={[{ required: true, message: 'Please enter username' }]}>
                        <Input placeholder="user123..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="Email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Email is not in the correct format!' }
                        ]}
                    >
                        <Input placeholder="example@gmail.com" size="large" />
                    </Form.Item>

                    <Form.Item label="Password" name="Password" rules={[{ required: true, message: 'Please enter the password!' }]}>
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="Confirm Password" name="confirm" rules={[{ required: true, message: 'Please confirm your password!' }]}>
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Role"
                        name="Role"
                        initialValue="user"
                    >
                        <Select size="large">
                            <Select.Option value="user">User</Select.Option>
                            <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className='login'>
                        <Button type="primary" htmlType="submit" block className='button1' loading={loading}>
                            Register
                        </Button>
                        <Button
                            type="default"
                            block
                            className='button2'
                            onClick={() => router.push('/login')}
                        >
                            Has Account? Login
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default RegisterPage;
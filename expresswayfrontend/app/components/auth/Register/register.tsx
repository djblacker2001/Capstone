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
                message.error('Mật khẩu không khớp');
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
                message.error(data.message || 'Đăng ký thất bại');
                return;
            }

            message.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.', 10);
            router.push('/login');

        } catch (err) {
            message.error('Lỗi server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='expr'>
            <Form onFinish={onFinish} layout="vertical" scrollToFirstError>
                <div className='logo'>
                    <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                </div>
                <h1><b>ĐĂNG KÝ</b></h1>

                <Form.Item label="Tên đăng nhập" name="Username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                    <Input placeholder="user123..." />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không đúng định dạng!' }
                    ]}
                >
                    <Input placeholder="example@gmail.com" />
                </Form.Item>

                <Form.Item label="Mật khẩu" name="Password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    label="Vai trò"
                    name="Role"
                    initialValue="user"
                >
                    <Select size="large">
                        <Select.Option value="user">Người dùng thông thường</Select.Option>
                        <Select.Option value="admin">Quản trị viên (Admin)</Select.Option>
                    </Select>
                </Form.Item>

                <div className='login'>
                    <Button type="primary" htmlType="submit" block className='button1' loading={loading}>
                        Đăng ký
                    </Button>
                    <Button
                        type="default"
                        block
                        className='button2'
                        onClick={() => router.push('/login')}
                        style={{ marginTop: '10px' }}
                    >
                        Đã có tài khoản? Đăng nhập
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default RegisterPage;
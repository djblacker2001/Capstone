'use client';

import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './login.css';
import Link from 'next/link';

const LoginPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            setError('');

            console.log("INPUT:", values);

            const res = await fetch('http://localhost:8080/users');
            const result = await res.json();

            console.log("API RESULT:", result);

            if (!result.success) {
                setError('Lỗi API');
                return;
            }

            const users = result.data;

            const user = users.find(
                (u: any) =>
                    u.Username.trim().toLowerCase() === values.username.trim().toLowerCase() &&
                    u.Password.trim() === values.password.trim()
            );

            console.log("FOUND USER:", user);

            if (!user) {
                setError('Sai username hoặc mật khẩu');
                return;
            }

            if (user.IsLocked) {
                setError('Tài khoản đã bị khóa');
                return;
            }

            if (!user.IsActive) {
                setError('Tài khoản chưa kích hoạt');
                return;
            }

            // 👉 lưu user
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event("storage"));

            message.success('Đăng nhập thành công!');

            if (user.Role === 'admin') {
                router.push('/admin');
                router.refresh();
            } else {
                // router.push('/');
                // router.refresh();
                window.location.href = '/';
            }

        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
        }
    };

    return (
        <div className='expr'>
            <Form onFinish={onFinish} layout="vertical">

                <div className='logo'>
                    <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                </div>

                <h1><b>HỆ THỐNG QUẢN LÝ CAO TỐC</b></h1>

                <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập username' }]}
                >
                    <Input placeholder="Nhập username" size="large" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" size="large" />
                </Form.Item>

                {error && <div className="login-error">{error}</div>}

                <div className='login'>
                    <Button type="primary" htmlType="submit" block className='button1'>
                        Đăng nhập
                    </Button>

                    <Button
                        type="default"
                        block
                        className='button2'
                        onClick={() => router.push('/register')}
                    >
                        Đăng ký
                    </Button>
                </div>

                <div className="footer-links">
                    <p><Link href="#">Quên mật khẩu?</Link></p>
                    <p><Link href="#">Cần giúp đỡ?</Link></p>
                </div>

            </Form>
        </div>
    );
};

export default LoginPage;
'use client';

import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './login.css';
import Link from 'next/link';

const LoginPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            setError('');
            console.log("INPUT:", values);

            // 1. Lấy danh sách users từ API
            const res = await fetch('http://localhost:8080/users');
            const result = await res.json();

            if (!res.ok || !result.success) {
                setError('Không thể lấy dữ liệu từ server');
                return;
            }

            const users = result.data;

            // 2. Tìm user khớp với Username và Password (SO SÁNH TRỰC TIẾP CHỮ THÔ)
            const user = users.find(
                (u: any) =>
                    u.Username.trim().toLowerCase() === values.username.trim().toLowerCase() &&
                    String(u.Password).trim() === String(values.password).trim()
            );

            console.log("FOUND USER:", user);

            if (!user) {
                setError('Sai tên đăng nhập hoặc mật khẩu');
                return;
            }

            if (user.IsLocked) {
                setError('Tài khoản này hiện đang bị khóa');
                return;
            }

            if (!user.IsActive) {
                setError('Tài khoản chưa được kích hoạt qua Email');
                return;
            }

            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event("storage"));

            message.success('Đăng nhập thành công!');
            window.location.href = '/';

        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='expr'>
            <Form onFinish={onFinish} layout="vertical">
                <div className='logo'>
                    <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                </div>

                <h1><b>ĐĂNG NHẬP</b></h1>

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

                {error && <div className="login-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <div className='login'>
                    <Button type="primary" htmlType="submit" block className='button1' loading={loading}>
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

                <div className="footer-links" style={{ textAlign: 'center', marginTop: '15px' }}>
                    <Link href="#">Quên mật khẩu?</Link>
                </div>
            </Form>
        </div>
    );
};

export default LoginPage;
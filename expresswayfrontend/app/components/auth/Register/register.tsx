//register.tsx
'use client';

import { Form, Input, Button, message, Col, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './register.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { register } from 'next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup';

const RegisterPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // 🚩 SỬA TẠI ĐÂY: Password phải viết hoa chữ P để khớp với name="Password" ở dưới
            if (values.Password !== values.confirm) {
                message.error('Mật khẩu không khớp');
                return;
            }

            const res = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: values.Username, // Chữ U hoa
                    Email: values.Email,       // Chữ E hoa
                    Password: values.Password, // Chữ P hoa
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.message || 'Đăng ký thất bại');
                return;
            }

            message.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.', 5);
            router.push('/login');

        } catch (err) {
            message.error('Lỗi server');
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
                <h1><b>ĐĂNG KÝ</b></h1>
                <Form.Item label="Tên đăng nhập" name="Username" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="Email" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Mật khẩu" name="Password" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true }]}>
                    <Input.Password />
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
                    >
                        Đăng nhập
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default RegisterPage;
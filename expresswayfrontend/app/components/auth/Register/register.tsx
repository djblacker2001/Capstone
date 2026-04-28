'use client';

import { Form, Input, Button, message, Col, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const RegisterPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string>('');

    const onFinish = (values: { username: string; password: string }) => {

    };

    return (
        <div className='expr'>
            <Form
                onFinish={onFinish}
                layout="vertical"
            >
                <div className='logo'>
                    <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                </div>
                <h1><b>HỆ THỐNG QUẢN LÝ CAO TỐC</b></h1>
                <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
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
                    <Button htmlType="submit" block className='button2'>
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

export default RegisterPage;
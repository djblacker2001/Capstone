'use client';

import { Form, Input, Button, message, Col, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './register.css';
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
            <Form onFinish={onFinish} layout="vertical">
                <div className='logo'>
                    <img src="/expresswayicon3.png" alt="logo3" style={{ width: '200px' }} />
                </div>
                <h1><b>ĐĂNG KÝ</b></h1>
                <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>

                <Form.Item label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true }]}>
                    <Input.Password />
                </Form.Item>

                <div className='login'>
                    <Button type="primary" htmlType="submit" block className='button1'>
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
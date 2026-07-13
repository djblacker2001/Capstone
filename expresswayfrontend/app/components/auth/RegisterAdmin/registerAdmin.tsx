'use client';

import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import './registerAdmin.css';

export default function RegisterAdminPage() {
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
                    RoleId: 1,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                message.error(data.message || 'Registration failed');
                return;
            }

            message.success('Admin registration successful! Please verify system activation email.', 6);
            router.push('/login');
        } catch (err) {
            console.error(err);
            message.error('Server Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='register-admin-wrapper'>
            <div className='expr'>
                <Form onFinish={onFinish} layout="vertical" scrollToFirstError>
                    <div className='logo'>
                        <img src="/expresswayicon3.png" alt="logo3" />
                    </div>
                    <h1><b>Admin Register</b></h1>

                    <Form.Item label="Administrator Username" name="Username" rules={[{ required: true, message: 'Please enter admin username' }]}>
                        <Input placeholder="admin_sys..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Internal Email"
                        name="Email"
                        rules={[
                            { required: true, message: 'Please enter your administrator email' },
                            { type: 'email', message: 'Email is not in the correct format!' }
                        ]}
                    >
                        <Input placeholder="admin.verify@company.com" size="large" />
                    </Form.Item>

                    <Form.Item label="Password" name="Password" rules={[{ required: true, message: 'Please enter the password!' }]}>
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="Confirm Password" name="confirm" rules={[{ required: true, message: 'Please confirm your password!' }]}>
                        <Input.Password size="large" />
                    </Form.Item>

                    <div className='login'>
                        <Button type="primary" htmlType="submit" className='button1' loading={loading}>
                            Create Admin
                        </Button>
                        <Button type="default" className='button2' onClick={() => router.push('/login')}>
                            Return to Login
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
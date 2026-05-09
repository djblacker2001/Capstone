// app/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import { message, Input, Button } from 'antd';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSendRequest = async () => {
    const res = await fetch('http://localhost:8080/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      message.success(data.message);
    } else {
      message.error(data.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>Quên mật khẩu?</h2>
      <p>Nhập email của bạn để nhận link đặt lại mật khẩu</p>
      <Input placeholder="Nhập Email" onChange={(e) => setEmail(e.target.value)} />
      <Button type="primary" onClick={handleSendRequest} style={{ marginTop: 20 }}>
        Gửi yêu cầu
      </Button>
    </div>
  );
}
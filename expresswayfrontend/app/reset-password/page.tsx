'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { message, Input, Button } from 'antd';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async () => {
    const res = await fetch('http://localhost:8080/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      message.success("Đổi mật khẩu thành công!");
      window.location.href = '/login';
    } else {
      message.error(data.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h2>Đặt lại mật khẩu mới</h2>
      <Input.Password placeholder="Mật khẩu mới" onChange={(e) => setNewPassword(e.target.value)} />
      <Button type="primary" block onClick={handleReset} style={{ marginTop: 20 }}>
        Cập nhật mật khẩu
      </Button>
    </div>
  );
}
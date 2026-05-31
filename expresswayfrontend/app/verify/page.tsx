'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { message } from 'antd';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  useEffect(() => {
    const verifyAccount = async () => {
      if (!code) return;

      try {
        const res = await fetch(`http://localhost:8080/auth/verify?code=${code}`);
        const data = await res.json();

        if (data.success) {
          message.success('Xác thực thành công!');
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push(`/`);
        } else {
          message.error(data.message || 'Xác thực thất bại');
          router.push('/login');
        }
      } catch (error) {
        console.error('Lỗi kết nối:', error);
        message.error('Không thể kết nối đến server');
      }
    };

    if (code) {
      verifyAccount();
    }
  }, [code, router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <div className="loader"></div>
      <h2>Đang xác nhận tài khoản...</h2>
      <p>Hệ thống đang kiểm tra mã kích hoạt của bạn.</p>
    </div>
  );
}
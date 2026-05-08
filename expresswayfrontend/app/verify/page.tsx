'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { message } from 'antd';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleVerify = async () => {
      if (!code) return;

      try {
        const res = await fetch(`http://localhost:8080/auth/verify?code=${code}`);
        const data = await res.json();

        if (data.success) {
          alert("Kích hoạt thành công! Đang chuyển sang trang đăng nhập...");
          window.location.href = '/login';
        } else {
          alert("Lỗi: " + data.message);
        }
      } catch (error) {
        alert("Lỗi kết nối Server!");
      }
    };

    handleVerify();
  }, [code]); // Chạy khi có code từ URL

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Đang xác nhận tài khoản...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
    </div>
  );
}
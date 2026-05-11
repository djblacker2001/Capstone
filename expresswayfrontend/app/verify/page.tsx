'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Sửa import ở đây
import { message } from 'antd';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  useEffect(() => {
    const verifyAccount = async () => {
      // KIỂM TRA: Nếu không có code thì không làm gì cả hoặc báo lỗi
      if (!code) return;

      try {
        const res = await fetch(`http://localhost:8080/auth/verify?code=${code}`);
        const data = await res.json();

        if (data.success) {
          message.success('Xác thực thành công!');

          // 1. Lưu token và thông tin user vào localStorage
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));

          // 2. Chuyển hướng đến trang upload avatar
          // Sử dụng backtick để truyền id vào đúng link
          router.push(`/uploadAvatar?userId=${data.user.id}`);
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
  }, [code, router]); // Thêm dependencies để tránh lỗi cảnh báo của React

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <div className="loader"></div>
      <h2>Đang xác nhận tài khoản...</h2>
      <p>Hệ thống đang kiểm tra mã kích hoạt của bạn.</p>
    </div>
  );
}
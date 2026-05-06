'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { message } from 'antd';

export default function VerifyPage() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');

    if (code) {
      fetch(`http://localhost:8080/auth/verify?code=${code}`)
        .then(res => res.json())
        .then(data => {
          message.success('Kích hoạt thành công!');
        })
        .catch(() => {
          message.error('Link không hợp lệ');
        });
    }
  }, []);

  return <h2>Đang xác nhận tài khoản...</h2>;
}
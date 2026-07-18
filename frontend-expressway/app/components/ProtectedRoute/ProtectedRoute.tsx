'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

// CẬP NHẬT: Định nghĩa lại prop `role` nhận vào là RoleId dạng số (1 hoặc 2)
type Props = {
    children: ReactNode;
    role?: 1 | 2; // 1: admin, 2: user
};

const isTokenExpired = (token: string | null) => {
    if (!token || token === "undefined") return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const { exp } = JSON.parse(jsonPayload);
        return Date.now() >= exp * 1000;
    } catch (error) {
        return true;
    }
};

export default function ProtectedRoute({ children, role }: Props) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!raw || isTokenExpired(token)) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            window.dispatchEvent(new Event("userUpdate"));
            router.replace('/login');
            return;
        }

        const user = JSON.parse(raw);

        // Debug log mới cho dễ theo dõi
        console.log('USER:', user);
        console.log('ROLE ID:', user.RoleId);
        console.log('CHECK ROLE ID:', user.RoleId, role);
        
        // CẬP NHẬT: Thay đổi điều kiện check từ user.Role sang user.RoleId
        if (role && Number(user.RoleId) !== Number(role)) {
            router.replace('/login');
            return;
        }

        setAllowed(true);
    }, [role, router]);

    if (!allowed) return null;

    return <>{children}</>;
}
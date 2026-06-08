'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

type Props = {
    children: ReactNode;
    role?: 'admin' | 'user';
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

        console.log('USER:', user);
        console.log('ROLE:', user.Role);
        console.log('CHECK ROLE:', user.Role, role);
        if (role && user.Role !== role) {
            router.replace('/login');
            return;
        }

        setAllowed(true);
    }, [role, router]);

    if (!allowed) return null;

    return <>{children}</>;
}
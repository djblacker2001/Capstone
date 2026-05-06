'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

type Props = {
    children: ReactNode;
    role?: 'admin' | 'user';
};

export default function ProtectedRoute({ children, role }: Props) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('user');

        if (!raw) {
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
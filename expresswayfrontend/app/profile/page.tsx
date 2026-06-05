'use client';
import { useState, useEffect } from 'react';
import { Input, Divider, Avatar } from 'antd';
import { UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import "./profile.css"
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MainLayout from '../layout/Layout';
import Header from "../components/Header/Header";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error("Failed to parse user data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
        const handleProfileUpdateEvent = () => {
            setTimeout(() => {
                loadUserFromStorage();
            }, 50);
        };

        window.addEventListener("userUpdate", handleProfileUpdateEvent);

        // Hủy lắng nghe khi rời trang để tránh rò rỉ bộ nhớ (Memory Leak)
        return () => {
            window.removeEventListener("userUpdate", handleProfileUpdateEvent);
        };
    }, []);

    if (!user) return <div style={{ textAlign: 'center', marginTop: 100 }}>Loading...</div>;
    const currentAvatar = user.Avatar || user.avatar;
    const avatarSrc = currentAvatar
        ? currentAvatar.startsWith('http')
            ? currentAvatar
            : currentAvatar.includes('uploads/avatars')
                ? `http://localhost:8080/${currentAvatar}`
                : `http://localhost:8080/uploads/avatars/${currentAvatar}`
        : undefined;

    return (
        <ProtectedRoute>
            <Header />
            <div className='profile-page-wrapper' style={{
                backgroundImage: "url('/backgroundlogin.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                width: "100%",
                minHeight: "calc(100vh - 58px)",
                overflowY: "hidden"
            }}>
                <div className="expr">
                    <div className="form">
                        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Personal profile</h2>
                        <Divider />
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                            <div style={{ display: 'inline-block' }}>
                                <Avatar
                                    size={120}
                                    icon={<UserOutlined />}
                                    src={avatarSrc}
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        color: '#bfbfbf',
                                        border: '1px solid #d9d9d9',
                                        cursor: 'default'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Username</label>
                            <Input value={user.Username || user.username} disabled prefix={<UserOutlined style={{ color: 'black' }} />} />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Email</label>
                            <Input value={user.Email || user.email} disabled />
                        </div>
                        <div style={{ marginBottom: 30 }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Role</label>
                            <Input
                                value={user.Role || user.role || 'Admin'}
                                disabled
                                prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                                style={{ fontWeight: 'bold', color: '#2e7d32' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
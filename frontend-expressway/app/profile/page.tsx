'use client';

import { useState, useEffect } from 'react';
import { Input, Divider, Avatar, message } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import "./profile.css";
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Header from "../components/Header/Header";

interface UserProfile {
    Username?: string;
    Email?: string;
    Role?: string;
    Avatar?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
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
        return () => {
            window.removeEventListener("userUpdate", handleProfileUpdateEvent);
        };
    }, []);

    useEffect(() => {
        const verifyAndLoadUser = async () => {
            if (typeof window === "undefined") return;

            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if (!savedUser || savedUser === "undefined" || !token || token === "undefined") {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('token');
                setUser(null);
                setLoading(false);
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`http://localhost:8080/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const responseJson = await res.json();
                    const freshUser = responseJson.data;

                    if (freshUser) {
                        localStorage.setItem('user', JSON.stringify(freshUser));
                        setUser(freshUser);
                    } else {
                        setUser(JSON.parse(savedUser));
                    }
                } else if (res.status === 401 || res.status === 403) {
                    message.error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('token');
                    setUser(null);
                    window.dispatchEvent(new Event("userUpdate"));
                    router.push('/login');
                    return;
                } else {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error("Lỗi kết nối xác thực phiên đăng nhập:", error);
                setUser(JSON.parse(savedUser));
            } finally {
                setLoading(false);
            }
        };

        verifyAndLoadUser();

        const handleProfileUpdateEvent = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        };

        window.addEventListener("userUpdate", handleProfileUpdateEvent);
        return () => {
            window.removeEventListener("userUpdate", handleProfileUpdateEvent);
        };
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <div style={{ fontFamily: 'sans-serif', fontSize: '16px', color: '#1890ff', fontWeight: 500 }}>
                    Đang xác thực tài khoản...
                </div>
            </div>
        );
    }

    if (!user) return null;
    const currentAvatar = user.Avatar;
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
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div className="expr" style={{ width: "100%" }}>
                    <div className="form">
                        <h2 style={{ textAlign: 'center', marginBottom: 20, fontWeight: 700, color: '#1f1f1f' }}>Personal Profile</h2>
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
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: '#434343' }}>Username</label>
                            <Input
                                value={user.Username}
                                disabled
                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                size="large"
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: '#434343' }}>Email Address</label>
                            <Input
                                value={user.Email}
                                disabled
                                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                size="large"
                            />
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: 8, color: '#434343' }}>System Role</label>
                            <Input
                                value={user.Role}
                                disabled
                                prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                                size="large"
                                style={{ fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
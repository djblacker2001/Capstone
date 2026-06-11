"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/api/axiosClient";

const { Header } = Layout;

interface UserData {
  Username?: string;
  Role?: string;
  Avatar?: string;
}

export default function MainHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
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

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!raw || isTokenExpired(token)) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');

        setUser(null);
      } else {
        setUser(JSON.parse(raw));
      }
    };

    loadUser();
    window.addEventListener('userUpdate', loadUser);
    return () => {
      window.removeEventListener('userUpdate', loadUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        btnRef.current && !btnRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Lỗi xóa token phía server:", error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/');
    }
  };

  const items = [
    { key: "home", label: <Link href="/home">Home</Link> },
    { key: "bangdieukhien", label: <Link href="/dashboard">Dashboard</Link> },
    { key: "tuyenduong", label: <Link href="/expressway">Expressway</Link> },
    { key: "bienbao", label: <Link href="/sign">Sign</Link> },

    ...(user?.Role === "admin"
      ? [
        { key: "manageExpressway", label: <Link href="/manageExpressway">Manage Expressway</Link> },
        { key: "manageUser", label: <Link href="/manageUser">Manage User</Link> },
        { key: "manageSign", label: <Link href="/manageSign">Manage Sign</Link> },
      ]
      : []),
  ];

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: <Link href="/profile">Personal information</Link> },
    { key: "settings", icon: <SettingOutlined />, label: <Link href="/setting">Setting</Link> },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
  ];

  const currentAvatar = user?.Avatar
  const avatarSrc = currentAvatar
    ? currentAvatar.startsWith('http')
      ? currentAvatar
      : currentAvatar.includes('uploads/avatars')
        ? `http://localhost:8080/${currentAvatar}`
        : `http://localhost:8080/uploads/avatars/${currentAvatar}`
    : undefined;

  return (
    <header className="warp-header">
      <Header className="mainHeader">
        <div className="left">
          <Button
            ref={btnRef}
            className="menuBtn"
            icon={<MenuOutlined />}
            onClick={() => setOpen(!open)}
          />
          <Link href="/">
            <Image src="/expresswayicon.png" alt="logo" width={50} height={50} />
          </Link>
        </div>

        <Menu mode="horizontal" items={items} className="desktopMenu" />

        <div className="right">
          {user ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div className="userBox" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: "white" }}>
                <Avatar
                  src={avatarSrc}
                  icon={<UserOutlined />}
                />
                <span className="username">
                  {user?.Username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button type="primary">Login</Button>
            </Link>
          )}
        </div>
      </Header>

      <div
        ref={menuRef}
        className={`mobileMenu ${open ? "show" : ""}`}
      >
        <Menu
          mode="inline"
          items={items}
          onClick={() => setOpen(false)}
        />
      </div>
    </header>
  );
}
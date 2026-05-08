"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const { Header } = Layout;

export default function MainHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // 1. Hàm load user dùng chung
  const loadUser = () => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // 2. useEffect quản lý dữ liệu user
  useEffect(() => {
    loadUser(); // Chạy khi load trang

    // Lắng nghe sự kiện "storage" từ các tab khác hoặc từ login.tsx
    window.addEventListener("storage", loadUser);
    
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // Logout xong về login cho sạch session
  };

  const items = [
    { key: "home", label: <Link href="/home">Trang chủ</Link> },
    { key: "gioithieu", label: <Link href="/gioi-thieu">Giới thiệu</Link> },
    { key: "tuyenduong", label: <Link href="/tuyen-duong">Tuyến đường</Link> },
    { key: "bienbao", label: <Link href="/bien-bao">Biển báo</Link> },

    // Kiểm tra Role (Lưu ý chữ R viết hoa theo DB của bạn)
    ...(user?.Role === "admin"
      ? [
          { key: "manageExpressway", label: <Link href="/manageExpressway">Quản lý cao tốc</Link> },
          { key: "manageUser", label: <Link href="/manageUser">Quản lý người dùng</Link> },
        ]
      : []),
  ];

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", onClick: handleLogout },
  ];

  return (
    <header>
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
              <div className="userBox" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar src={user.Avatar || undefined} icon={<UserOutlined />} />
                {/* Đảm bảo dùng Username (U hoa) khớp với DB */}
                <span className="username">{user.Username}</span>
              </div>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button type="primary">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </Header>
    </header>
  );
}
"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Giữ lại đúng thư viện điều hướng của Next.js
import axiosClient from "@/api/axiosClient";

const { Header } = Layout;

// Định nghĩa Interface rõ ràng cho kiểu dữ liệu User để chuẩn hóa TSX
interface UserData {
  username?: string;
  Username?: string;
  role?: string;
  Role?: string;
  avatar?: string;
  Avatar?: string;
}

export default function MainHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
  const loadUser = () => {
    if (typeof window === "undefined") return;
    
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (savedUser && savedUser !== "undefined" && token && token !== "undefined") {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi parse user tại Header:", error);
      setUser(null);
    }
  };

  loadUser();

  const handleUpdateEvent = () => {
    setTimeout(() => { loadUser(); }, 50);
  };

  window.addEventListener("userUpdate", handleUpdateEvent);
  return () => { window.removeEventListener("userUpdate", handleUpdateEvent); };
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
      setUser(null); // Đưa state về null ngay lập tức để giao diện ẩn vùng avatar đi
      router.push('/');
    }
  };

  // Cấu hình danh mục Menu Navbar chính
  const items = [
    { key: "home", label: <Link href="/home">Home</Link> },
    { key: "bangdieukhien", label: <Link href="/dashboard">Dashboard</Link> },
    { key: "tuyenduong", label: <Link href="/expressway">Expressway</Link> },
    { key: "bienbao", label: <Link href="/sign">Sign</Link> },

    ...(user?.Role === "admin" || user?.role === "admin"
      ? [
        { key: "manageExpressway", label: <Link href="/manageExpressway">Manage Expressway</Link> },
        { key: "manageUser", label: <Link href="/manageUser">Manage User</Link> },
        { key: "manageSign", label: <Link href="/manageSign">Manage Sign</Link> },
      ]
      : []),
  ];

  // Cấu hình Menu Dropdown khi click vào Avatar góc phải
  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: <Link href="/profile">Personal information</Link> },
    { key: "settings", icon: <SettingOutlined />, label: <Link href="/setting">Setting</Link> },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
  ];

  // Logic xử lý đường dẫn ảnh đại diện an toàn
  const currentAvatar = user?.Avatar || user?.avatar;
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
                  {user?.Username || user?.username || "User"}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button type="primary">Đăng nhập</Button>
            </Link>
          )}
        </div>
      </Header>

      {/* Mobile Drawer Menu Layer */}
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
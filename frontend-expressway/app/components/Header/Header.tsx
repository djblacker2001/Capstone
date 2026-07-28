"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps, Space } from "antd";
import { DownOutlined, GlobalOutlined, LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
// 1. Import usePathname từ next/navigation
import { useRouter, usePathname } from "next/navigation";
import axiosClient from "@/api/axiosClient";
import { useTranslation } from "react-i18next";

const { Header } = Layout;

interface UserData {
  Username?: string;
  RoleId?: number;
  Avatar?: string;
}

export default function MainHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  
  const pathname = usePathname();

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languageItems: MenuProps['items'] = [
    {
      key: 'en',
      label: 'English',
      disabled: i18n.language === 'en',
      onClick: () => changeLanguage('en'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt',
      disabled: i18n.language === 'vi',
      onClick: () => changeLanguage('vi'),
    },
  ];

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

  // 3. Quy định key của items khớp trực tiếp với đường dẫn href
  const items = [
    { key: "/home", label: <Link href="/home">{t("header.homepage")}</Link> },
    { key: "/dashboard", label: <Link href="/dashboard">{t("header.dashboard")}</Link> },
    { key: "/expressway", label: <Link href="/expressway">{t("header.expressway")}</Link> },
    { key: "/sign", label: <Link href="/sign">{t("header.sign")}</Link> },

    ...(user?.RoleId === 1
      ? [
        { key: "/manageExpressway", label: <Link href="/manageExpressway">{t("header.manageExpressway")}</Link> },
        { key: "/manageUser", label: <Link href="/manageUser">{t("header.manageUser")}</Link> },
        { key: "/manageSign", label: <Link href="/manageSign">{t("header.manageSign")}</Link> },
      ]
      : []),
  ];

  // 4. Hàm xác định key đang active (hỗ trợ cả các trang con, ví dụ: /expressway/123 vẫn sáng tab /expressway)
  const getSelectedKey = () => {
    const matchedItem = items.find((item) => 
      pathname === item.key || (item.key !== "/" && pathname.startsWith(item.key))
    );
    return matchedItem ? [matchedItem.key] : [pathname];
  };

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: <Link href="/profile">Personal information</Link> },
    { key: "settings", icon: <SettingOutlined />, label: <Link href="/setting">Setting</Link> },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
  ];

  const currentAvatar = user?.Avatar;
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

        {/* 5. Truyền selectedKeys vào Desktop Menu */}
        <Menu 
          mode="horizontal" 
          items={items} 
          selectedKeys={getSelectedKey()} 
          className="desktopMenu" 
        />

        <div className="right">
          <Dropdown menu={{ items: languageItems }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()} className="languages">
              <Space>
                <GlobalOutlined />
                {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
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
              <Button type="primary">{t("header.login")}</Button>
            </Link>
          )}
        </div>
      </Header>

      <div
        ref={menuRef}
        className={`mobileMenu ${open ? "show" : ""}`}
      >
        {/* 6. Truyền selectedKeys vào Mobile Menu */}
        <Menu
          mode="inline"
          items={items}
          selectedKeys={getSelectedKey()}
          onClick={() => setOpen(false)}
        />
      </div>
    </header>
  );
}
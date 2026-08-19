"use client";
import "./header.css";
import { Menu, Button, Avatar, Dropdown, MenuProps} from "antd";
import { GlobalOutlined, LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axiosClient from "@/api/axiosClient";
import { useTranslation } from "react-i18next";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
interface UserData {
  Username?: string;
  RoleId?: number | string;
  Avatar?: string;
  [key: string]: any;
}

export default function MainHeader() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const nextLang = currentLang === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
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
      try {
        const parsed = JSON.parse(raw);
        setUser((prevUser) => {
          const currentRole = parsed.RoleId ?? parsed.roleId ?? prevUser?.RoleId ?? prevUser?.roleId;
          return {
            ...parsed,
            RoleId: currentRole,
            roleId: currentRole
          };
        });
      } catch (e) {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('userUpdate', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('userUpdate', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [pathname]);

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
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      setUser(null);
      router.push('/');
    }
  };

  const roleVal = user?.RoleId ?? user?.roleId;
  const isAdmin = Number(roleVal) === 1;

  const items = [
    { key: "/", label: <Link href="/">{t("header.homepage")}</Link> },
    { key: "/expressway", label: <Link href="/expressway">{t("header.expressway")}</Link> },
    { key: "/map", label: <Link href="/map">{t("header.map")}</Link> },
    { key: "/sign", label: <Link href="/sign">{t("header.sign")}</Link> },

    ...(isAdmin
      ? [
        { key: "/dashboard", label: <Link href="/dashboard">{t("header.dashboard")}</Link> },
        { key: "/manageExpressway", label: <Link href="/manageExpressway">{t("header.manageExpressway")}</Link> },
        { key: "/manageUser", label: <Link href="/manageUser">{t("header.manageUser")}</Link> },
        { key: "/manageSign", label: <Link href="/manageSign">{t("header.manageSign")}</Link> },
      ]
      : []),
  ];

  const getSelectedKey = () => {
    const matchedItem = items.find((item) =>
      pathname === item.key || (item.key !== "/" && pathname.startsWith(item.key))
    );
    return matchedItem ? [matchedItem.key] : [];
  };

  const userMenu: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: <Link href="/profile">Personal information</Link> },
    { key: "settings", icon: <SettingOutlined />, label: <Link href="/setting">Setting</Link> },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
  ];

  const currentAvatar = user?.Avatar || user?.avatar;
  const username = user?.Username || user?.username || 'Admin';

  const avatarSrc = currentAvatar
    ? currentAvatar.startsWith('http')
      ? currentAvatar
      : currentAvatar.includes('uploads/avatars')
        ? `${baseUrl}/${currentAvatar}`
        : `${baseUrl}/uploads/avatars/${currentAvatar}`
    : undefined;

  return (
    <div className="warp-header">
      <header className="mainHeader">
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

        <Menu
          mode="horizontal"
          items={items}
          selectedKeys={getSelectedKey()}
          className="desktopMenu"
        />

        <div className="right">
          <Button
            type="text"
            onClick={toggleLanguage}
            icon={<GlobalOutlined />}
            className="languages-btn"
          >
            {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
          </Button>
          {user ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div className="userBox" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: "white" }}>
                <Avatar
                  src={avatarSrc}
                  icon={<UserOutlined />}
                />
                <span className="username">
                  {username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Link href="/login">
              <Button type="primary">{t("header.login")}</Button>
            </Link>
          )}
        </div>
      </header>

      <div
        ref={menuRef}
        className={`mobileMenu ${open ? "show" : ""}`}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={getSelectedKey()}
          onClick={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
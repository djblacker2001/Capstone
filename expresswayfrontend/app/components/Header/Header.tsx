"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const { Header } = Layout;

export default function MainHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const items = [
    { key: "home", label: <Link href="/home">Trang chủ</Link> },
    { key: "gioithieu", label: <Link href="/gioi-thieu">Giới thiệu</Link> },
    { key: "tuyenduong", label: <Link href="/tuyen-duong">Tuyến đường</Link> },
    { key: "bienbao", label: <Link href="/bien-bao">Biển báo</Link> },
    { key: "tintuc", label: <Link href="/tin-tuc">Tin tức</Link> },
    { key: "nhadautu", label: <Link href="/nha-dau-tu">Nhà đầu tư</Link> },
    { key: "lienhe", label: <Link href="/lien-he">Liên hệ</Link> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      else setUser(null);
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch("http://localhost:8080/users");
        const result = await res.json();

        const users = result.data;

        const currentUser = users.find(
          (u: any) => u.UserId.toString() === userId
        );

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Lỗi load user:", err);
      }
    };

    fetchUser();
  }, []);

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
            <Image
              src="/expresswayicon.png"
              alt="logo"
              width={50}
              height={50}
            />
          </Link>
        </div>

        <Menu mode="horizontal" items={items} className="desktopMenu" />

        {/* RIGHT (USER) */}
        <div className="right">
          {user ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div className="userBox">
                <Avatar src={user.Avatar || undefined} icon={<UserOutlined />} />
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

      {/* 👇 MOBILE MENU */}
      <div ref={menuRef} className={`mobileMenu ${open ? "show" : ""}`}>
        <Menu mode="vertical" items={items} />
      </div>
    </header>
  );
}
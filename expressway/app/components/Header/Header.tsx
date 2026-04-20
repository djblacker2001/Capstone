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

  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const items = [
    { key: "home", label: <Link href="/">Trang chủ</Link> },
    { key: "gioithieu", label: <Link href="/gioi-thieu">Giới thiệu</Link> },
    { key: "tuyenduong", label: <Link href="/tuyen-duong">Tuyến đường</Link> },
    { key: "bienbao", label: <Link href="/bien-bao">Biển báo</Link> },
    { key: "tintuc", label: <Link href="/tin-tuc">Tin tức</Link> },
    { key: "nhadautu", label: <Link href="/nha-dau-tu">Nhà đầu tư</Link> },
    { key: "lienhe", label: <Link href="/lien-he">Liên hệ</Link> },
  ];

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
    },
  ];

  // 👇 detect click outside
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
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div className="userBox">
              <Avatar icon={<UserOutlined />} />
              <span className="username">Admin</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* 👇 MOBILE MENU */}
      <div ref={menuRef} className={`mobileMenu ${open ? "show" : ""}`}>
        <Menu mode="vertical" items={items} />
      </div>
    </header>
  );
}

// import "./header.css";
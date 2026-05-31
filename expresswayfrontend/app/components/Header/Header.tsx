"use client";
import "./header.css";
import { Layout, Menu, Button, Avatar, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";
import axiosClient from "@/api/axiosClient";


const { Header } = Layout;

export default function MainHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {

    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("user");

        console.log("LOAD USER:", savedUser);

        if (savedUser && savedUser !== "undefined") {
          const parsed = JSON.parse(savedUser);

          console.log("PARSED USER:", parsed);

          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi parse user:", error);
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("userUpdate", loadUser);

    return () => {
      window.removeEventListener("userUpdate", loadUser);
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

  // const handleLogout = () => {
  //   localStorage.removeItem("user");
  //   setUser(null);
  //   window.location.href = "/";
  // };

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error("Lỗi xóa token phía server:", error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
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
    { key: "settings", icon: <SettingOutlined />, label: "Setting" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Log out", onClick: handleLogout },
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
                <Avatar
                  src={
                    user?.Avatar || user?.avatar
                      ? `http://localhost:8080/${user.Avatar || user.avatar}`
                      : undefined
                  }
                  icon={!user?.Avatar && <UserOutlined />}
                />
                <span className="username">
                  {user.Username || user.username}
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
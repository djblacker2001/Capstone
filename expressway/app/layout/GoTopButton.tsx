"use client";

import { useEffect, useState } from "react";
import "./layout.css"
import { UpOutlined } from "@ant-design/icons";

export default function GoTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!visible) return null;

    return (
        <button className="goTopBtn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <UpOutlined />
        </button>
    );
}
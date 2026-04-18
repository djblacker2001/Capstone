"use client";

import { useState } from "react";

import "./layout.css"
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

type Props = {
    children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState("");
    const [searchText, setSearchText] = useState("");

    return (
        <div className="layout">
            <Header />
            <div className="main">
                <div className="content">{children}</div>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
"use client";

import { useState } from "react";
import "./layout.css"
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import GoTopButton from "./GoTopButton";

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props){
    return (
        <div className="layout">
            <GoTopButton />
            <Header />
            <div className="main">
                <div className="content">{children}</div>
            </div>
            <Footer />
        </div>
    );
};
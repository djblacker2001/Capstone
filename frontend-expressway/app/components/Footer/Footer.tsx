"use client";

import "./footer.css";
import Link from "next/link";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function Footer() {
    const { t } = useTranslation();
    const [currentYear, setCurrentYear] = useState<number | string>("");

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer>
            <div className="footer">
                <div className="footer-top">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={6}>
                            <div className="footer-brand">
                                <Row>
                                    <Col span={6}>
                                        <img src="/expresswayicon2.png" style={{ width: 60 }} alt="logo" />
                                    </Col>
                                    <Col span={18}>
                                        <h3 suppressHydrationWarning>{t("footer.title")}</h3>
                                    </Col>
                                </Row>
                            </div>
                            <p suppressHydrationWarning>{t("footer.text")}</p>
                        </Col>

                        <Col xs={24} md={6}>
                            <h3 suppressHydrationWarning>{t("footer.discover")}</h3>
                            <ul className="footer-list">
                                <li>
                                    <Link href="/expressway" suppressHydrationWarning>
                                        {t("header.expressway")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/map" suppressHydrationWarning>
                                        {t("header.map")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/sign" suppressHydrationWarning>
                                        {t("header.sign")}
                                    </Link>
                                </li>
                            </ul>
                        </Col>

                        <Col xs={24} md={6}>
                            <h3 suppressHydrationWarning>{t("footer.information")}</h3>
                            <ul className="footer-list">
                                <li><Link href="/dashboard">Planning</Link></li>
                                <li><Link href="/dashboard">Progress</Link></li>
                                <li><Link href="/dashboard">Statistical</Link></li>
                                <li><Link href="/dashboard">Data</Link></li>
                            </ul>
                        </Col>

                        <Col xs={24} md={6}>
                            <h3 suppressHydrationWarning>{t("footer.contact")}</h3>
                            <ul className="footer-list">
                                <li>Student: Vũ Lê Hoàng</li>
                                <li>IRN: 2331200226</li>
                                <li>Eastern International University</li>
                                <li>Email: hoang.vu.cit23@eiu.edu.vn</li>
                            </ul>
                        </Col>
                    </Row>
                </div>

                <div className="footer-bottom">
                    &copy; <span suppressHydrationWarning>{currentYear}</span> <span suppressHydrationWarning>{t("footer.bottom")}</span>
                </div>
            </div>
        </footer>
    );
}
import "./footer.css";
import Link from "next/link";
import { Row, Col } from "antd";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <div className="footer">
                <div className="footer-top">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={6}>
                            <div className="footer-brand">
                                <Row>
                                    <Col span={6}>
                                        <img src="./expresswayicon2.png" style={{ width: 60 }} alt="logo" />
                                    </Col>
                                    <Col span={18}>
                                        <h3>Expressway Management System</h3>
                                    </Col>
                                </Row>
                            </div>
                            <p>The website provides information about the North-South expressway system, including maps, routes, and construction progress.</p>
                        </Col>
                        <Col xs={24} md={6}>
                            <h3>Khám phá</h3>
                            <ul className="footer-list">
                                <li><Link href="/introduce">Introduce</Link></li>
                                <li><Link href="/expressway">Expressway</Link></li>
                                <li><Link href="/map">Map</Link></li>
                                <li><Link href="/sign">Sign</Link></li>
                                <li><Link href="/news">News</Link></li>
                            </ul>
                        </Col>
                        <Col xs={24} md={6}>
                            <h3>Thông tin</h3>
                            <ul className="footer-list">
                                <li><Link href="/quy-hoach">Quy hoạch</Link></li>
                                <li><Link href="/tien-do">Tiến độ</Link></li>
                                <li><Link href="/thong-ke">Thống kê</Link></li>
                                <li><Link href="/du-lieu">Dữ liệu</Link></li>
                            </ul>
                        </Col>
                        <Col xs={24} md={6}>
                            <h3>Liên hệ</h3>
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
                    © {currentYear} Expressway Management System in Vietnam
                </div>
            </div>
        </footer>
    );
};

export default Footer;
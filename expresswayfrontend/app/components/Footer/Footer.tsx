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

                        {/* Cột 1 */}
                        <Col xs={24} md={6}>
                            <div className="footer-brand">
                                <Row>
                                    <Col span={6}>
                                        <img src="./expresswayicon2.png" style={{ width: 60 }} alt="logo" />
                                    </Col>
                                    <Col span={18}>
                                        <h3>Hệ thống Đường cao tốc Việt Nam</h3>
                                    </Col>
                                </Row>
                            </div>
                            <p>
                                Website cung cấp thông tin về hệ thống cao tốc Bắc – Nam,
                                bao gồm bản đồ, tuyến đường và tiến độ xây dựng.
                            </p>
                        </Col>

                        {/* Cột 2 */}
                        <Col xs={24} md={6}>
                            <h3>Khám phá</h3>
                            <ul className="footer-list">
                                <li><Link href="/gioi-thieu">Giới thiệu</Link></li>
                                <li><Link href="/tuyen-duong">Tuyến đường</Link></li>
                                <li><Link href="/ban-do">Bản đồ</Link></li>
                                <li><Link href="/bien-bao">Biển báo</Link></li>
                                <li><Link href="/tin-tuc">Tin tức</Link></li>
                            </ul>
                        </Col>

                        {/* Cột 3 */}
                        <Col xs={24} md={6}>
                            <h3>Thông tin</h3>
                            <ul className="footer-list">
                                <li><Link href="/quy-hoach">Quy hoạch</Link></li>
                                <li><Link href="/tien-do">Tiến độ</Link></li>
                                <li><Link href="/thong-ke">Thống kê</Link></li>
                                <li><Link href="/du-lieu">Dữ liệu</Link></li>
                            </ul>
                        </Col>

                        {/* Cột 4 */}
                        <Col xs={24} md={6}>
                            <h3>Liên hệ</h3>
                            <ul className="footer-list">
                                <li>Sinh viên: Vũ Lê Hoàng</li>
                                <li>MSSV: 2331200226</li>
                                <li>Trường: Đại học quốc tế miền đông</li>
                                <li>Email: hoang.vu.cit23@eiu.edu.vn</li>
                            </ul>
                        </Col>

                    </Row>
                </div>

                <div className="footer-bottom">
                    © {currentYear} Hệ thống Đường cao tốc Việt Nam
                </div>
            </div>
        </footer>
    );
};

export default Footer;
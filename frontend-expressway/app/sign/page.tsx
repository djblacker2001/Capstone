'use client';

import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Card, Row, Col, Input, Select, Spin, Tag, Empty, Typography, message } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import axios from "axios";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
interface Sign {
    SignId: number;
    Symbol: string;
    Image: string;
    Description: string;
}

const SignPage = () => {
    const [signs, setSigns] = useState<Sign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('All');

    useEffect(() => {
        axios.get('http://localhost:8080/signs')
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setSigns(res.data);
                }
                else if (res.data && Array.isArray(res.data.data)) {
                    setSigns(res.data.data);
                } else if (res.data && Array.isArray(res.data.result)) {
                    setSigns(res.data.result);
                }
                else {
                    console.error('Dữ liệu API trả về không đúng định dạng mảng:', res.data);
                    setSigns([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Lỗi lấy danh sách biển báo:', err);
                setSigns([]); // Lỗi thì đưa về mảng rỗng để chặn lỗi sập .filter
                setLoading(false);
            });
    }, []);

    const getSignType = (symbol: string): string => {
        if (!symbol) return 'Khác';
        const upperSymbol = symbol.toUpperCase();

        if (upperSymbol.startsWith('IE') || upperSymbol.startsWith('IF')) {
            return 'Biển chỉ dẫn cao tốc';
        }
        if (upperSymbol.startsWith('P')) {
            return 'Biển cấm';
        }
        if (upperSymbol.startsWith('W')) {
            return 'Biển nguy hiểm';
        }
        if (upperSymbol.startsWith('R')) {
            return 'Biển hiệu lệnh';
        }
        return 'Biển báo khác';
    };

    // Hàm lọc danh sách
    const filteredSigns = signs.filter((sign) => {
        const matchSearch =
            (sign.Symbol && sign.Symbol.toLowerCase().includes(searchText.toLowerCase())) ||
            (sign.Description && sign.Description.toLowerCase().includes(searchText.toLowerCase()));

        const type = getSignType(sign.Symbol);
        const matchType = selectedType === 'All' || type === selectedType;

        return matchSearch && matchType;
    });

    // Chọn màu sắc Tag tương ứng với nhóm biển báo
    const getTagColor = (type: string) => {
        switch (type) {
            case 'Biển chỉ dẫn cao tốc': return 'blue';
            case 'Biển cấm': return 'red';
            case 'Biển nguy hiểm': return 'orange';
            case 'Biển hiệu lệnh': return 'cyan';
            default: return 'default';
        }
    };
    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>

                    {/* Tiêu đề */}
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                            Hệ Thống Biển Báo Đường Bộ & Cao Tốc
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            Tra cứu nhanh ký hiệu và ý nghĩa hệ thống biển chỉ dẫn quy chuẩn trên tuyến
                        </Text>
                    </div>

                    {/* Bộ lọc tìm kiếm */}
                    <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Input
                                    placeholder="Tìm kiếm theo mã ký hiệu hoặc nội dung ý nghĩa (Ví dụ: IE.450, Exit, Interchange...)"
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                    size="large"
                                />
                            </Col>
                            <Col xs={24} md={8}>
                                <Select
                                    suffixIcon={<FilterOutlined />}
                                    style={{ width: '100%' }}
                                    value={selectedType}
                                    onChange={(value) => setSelectedType(value)}
                                    size="large"
                                >
                                    <Option value="All">Tất cả nhóm biển báo</Option>
                                    <Option value="Biển chỉ dẫn cao tốc">Biển chỉ dẫn cao tốc (IE/IF)</Option>
                                    <Option value="Biển cấm">Biển báo cấm (P)</Option>
                                    <Option value="Biển nguy hiểm">Biển nguy hiểm (W)</Option>
                                    <Option value="Biển hiệu lệnh">Biển hiệu lệnh (R)</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Card>

                    {/* Danh sách lưới */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Spin size="large" tip="Đang kết nối cơ sở dữ liệu..." />
                        </div>
                    ) : filteredSigns.length > 0 ? (
                        <Row gutter={[20, 20]}>
                            {filteredSigns.map((sign) => {
                                const type = getSignType(sign.Symbol);
                                // Nối domain back-end nếu trường Image trong DB của bạn chỉ lưu chuỗi tương đối 'uploads/...'
                                const fullImageUrl = sign.Image.startsWith('http')
                                    ? sign.Image
                                    : `http://localhost:8080/${sign.Image}`; // Thay 5000 bằng port back-end của bạn

                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={sign.SignId}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: '12px',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                border: '1px solid #f0f0f0'
                                            }}
                                            bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                                            cover={
                                                <div style={{
                                                    background: '#f9f9f9',
                                                    height: '160px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: '12px',
                                                    borderBottom: '1px solid #f5f5f5'
                                                }}>
                                                    <img
                                                        alt={sign.Symbol}
                                                        src={fullImageUrl}
                                                        onError={(e) => {
                                                            // Ảnh lỗi thì đắp ảnh mặc định thế chỗ
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/150?text=No+Image';
                                                        }}
                                                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            }
                                        >
                                            <div style={{ marginBottom: '8px' }}>
                                                <Tag color={getTagColor(type)} style={{ fontWeight: 600, borderRadius: '4px' }}>
                                                    {sign.Symbol}
                                                </Tag>
                                            </div>

                                            <Text style={{
                                                fontSize: '14px',
                                                color: '#262626',
                                                fontWeight: '500',
                                                lineHeight: '1.5',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {sign.Description || 'No description available.'}
                                            </Text>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <Empty description="Không tìm thấy biển báo nào khớp với từ khóa tra cứu." style={{ marginTop: '60px' }} />
                    )}
                </div>
            </MainLayout>
        </ProtectedRoute>
    )
}

export default SignPage;
'use client';

import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Card, Row, Col, Input, Select, Spin, Tag, Empty, Typography } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";

const { Title, Text } = Typography;
const { Option } = Select;
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
interface Sign {
    SignId: number;
    Symbol: string;
    Image?: string | null;
    Description?: string | null;
    signType?: {
        SignTypeId: number;
        NameSignType: string;
    };
}

const SignPage = () => {
    const [signs, setSigns] = useState<Sign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedTypeId, setSelectedTypeId] = useState<string>('All');
    const fetchSigns = async (typeId: string) => {
        setLoading(true);
        try {
            const url = typeId === 'All'
                ? `/signs`
                : `/signs/type/${typeId}`;

            const res = await axiosClient.get(url);
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data || res.data?.result || [];

            setSigns(data);
        } catch (err) {
            console.error('Lỗi lấy danh sách biển báo:', err);
            setSigns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSigns(selectedTypeId);
    }, [selectedTypeId]);

    const getFullImageUrl = (imagePath?: string | null) => {
        if (!imagePath) return 'https://placehold.co/150?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${baseUrl}/${imagePath}`;
    };

    const getSignTypeName = (sign: Sign): string => {
        if (sign.signType?.NameSignType) {
            return sign.signType.NameSignType;
        }
        if (!sign.Symbol) return 'Khác';
        const upper = sign.Symbol.toUpperCase();
        if (upper.startsWith('P')) return 'Biển báo cấm';
        if (upper.startsWith('W')) return 'Biển nguy hiểm và cảnh báo';
        if (upper.startsWith('R')) return 'Biển hiệu lệnh';
        if (upper.startsWith('I')) return 'Biển chỉ dẫn';
        if (upper.startsWith('S')) return 'Biển phụ';
        return 'Biển báo khác';
    };

    const getTagColor = (typeId?: number) => {
        switch (typeId) {
            case 1: return 'red';
            case 2: return 'orange';
            case 3: return 'blue';
            case 4: return 'cyan';
            case 5: return 'green';
            case 6: return 'purple';
            default: return 'default';
        }
    };

    const filteredSigns = signs.filter((sign) => {
        const symbolMatch = sign.Symbol?.toLowerCase().includes(searchText.toLowerCase());
        const descMatch = sign.Description?.toLowerCase().includes(searchText.toLowerCase());
        return symbolMatch || descMatch;
    });

    return (
        <ProtectedRoute>
            <MainLayout>
                <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>

                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                            Road and Expressway Signage System
                        </Title>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                            Quick reference for symbols and meanings of the standardized directional signage system along the route.
                        </Text>
                    </div>

                    <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={16}>
                                <Input
                                    placeholder="Tìm kiếm theo mã ký hiệu hoặc nội dung ý nghĩa (Ví dụ: P.101, W.201, Exit...)"
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
                                    value={selectedTypeId}
                                    onChange={(value) => setSelectedTypeId(value)}
                                    size="large"
                                >
                                    <Option value="All">Tất cả nhóm biển báo (All signs)</Option>
                                    <Option value="1">Biển cấm (Prohibition signs)</Option>
                                    <Option value="2">Biển nguy hiểm (Hazard signs)</Option>
                                    <Option value="3">Biển hiệu lệnh (Command signs)</Option>
                                    <Option value="4">Biển chỉ dẫn (Signposts)</Option>
                                    <Option value="5">Biển trên đường cao tốc (Expressway sign)</Option>
                                    <Option value="6">Biển phụ (Supplementary sign)</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Card>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Spin size="large" tip="Đang kết nối cơ sở dữ liệu..." />
                        </div>
                    ) : filteredSigns.length > 0 ? (
                        <Row gutter={[20, 20]}>
                            {[...filteredSigns]
                                .sort((a, b) => {
                                    const nameA = getSignTypeName(a) || '';
                                    const nameB = getSignTypeName(b) || '';
                                    const typeComparison = nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
                                    if (typeComparison !== 0) return typeComparison;

                                    const symbolA = a.Symbol || '';
                                    const symbolB = b.Symbol || '';
                                    return symbolA.localeCompare(symbolB, 'vi', { numeric: true, sensitivity: 'base' });
                                })
                                .map((sign) => {
                                    const fullImageUrl = getFullImageUrl(sign.Image);
                                    const typeName = getSignTypeName(sign);
                                    const tagColor = getTagColor(sign.signType?.SignTypeId);

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
                                                            alt={sign.Symbol || 'Sign'}
                                                            src={fullImageUrl}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/150?text=No+Image';
                                                            }}
                                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                }
                                            >
                                                <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <Tag color={tagColor} style={{ fontWeight: 600, borderRadius: '4px' }}>
                                                        {sign.Symbol}
                                                    </Tag>
                                                    <Tag style={{ borderRadius: '4px', fontSize: '11px' }}>
                                                        {typeName}
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
                                                    overflow: 'hidden',
                                                    whiteSpace: 'pre-line'
                                                }}>
                                                    {sign.Description || 'Chưa có thông tin mô tả.'}
                                                </Text>
                                            </Card>
                                        </Col>
                                    );
                                })}
                        </Row>
                    ) : (
                        <Empty description="Không tìm thấy biển báo nào khớp với yêu cầu." style={{ marginTop: '60px' }} />
                    )}
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export default SignPage;
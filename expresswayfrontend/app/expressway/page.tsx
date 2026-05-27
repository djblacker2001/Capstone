'use client';
import dynamic from 'next/dynamic';
import { Table, Card, Row, Col, Input, Button, Space, Tag, message } from 'antd';
import { SearchOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const ExpresswayPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Hàm gọi API lấy dữ liệu thống kê phân đoạn
    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/sections/statistics');
            if (!res.ok) throw new Error('Không thể lấy dữ liệu thống kê');
            const result = await res.json();

            // 🔥 SỬA DÒNG NÀY ĐỂ TRÍCH XUẤT ĐÚNG MẢNG:
            // Kiểm tra xem dữ liệu nằm trong result.data hay chính là result
            const arrayData = result.data || result;

            if (Array.isArray(arrayData)) {
                setData(arrayData);
            } else {
                console.error("Dữ liệu trả về không phải là mảng:", result);
                setData([]); // Phòng hờ nếu có lỗi cấu trúc thì gán mảng rỗng để không bị sập web
            }

        } catch (error) {
            console.error(error);
            message.error('Lỗi kết nối đến API thống kê phân đoạn');
            setData([]); // Đảm bảo luôn là mảng khi có lỗi kết nối
        } finally {
            setLoading(false);
        }
    };

    // Đảm bảo data luôn là mảng trước khi tính toán


    // Tính toán số liệu tổng hợp động dựa trên dữ liệu thật
    const isArray = Array.isArray(data);
    const totalSections = isArray ? data.length : 0;

    const totalLength = isArray
        ? data.reduce((sum, item) => sum + (Number(item.totalSectionLength) || 0), 0).toFixed(1)
        : "0.0";

    const totalBridges = isArray
        ? data.reduce((sum, item) => sum + (Number(item.bridgeCount) || 0), 0)
        : 0;

    const totalTunnels = isArray
        ? data.reduce((sum, item) => sum + (Number(item.tunnelCount) || 0), 0)
        : 0;
    useEffect(() => {
        fetchStatistics();
    }, []);

    // ✅ ĐƯA MẢNG COLUMNS VÀO TRONG ĐÂY ĐỂ TRÁNH LỖI PHÂN TÁCH SERVER/CLIENT COMPONENT
    const columns = [
        {
            title: 'Tên Phân Đoạn',
            dataIndex: 'sectionName',
            key: 'sectionName',
            render: (text: string) => <b>{text}</b>,
        },
        {
            title: 'Thuộc Cao Tốc',
            dataIndex: 'expresswayName',
            key: 'expresswayName',
        },
        {
            title: 'Chiều Dài',
            dataIndex: 'totalSectionLength',
            key: 'totalSectionLength',
            render: (len: number) => <Tag color="blue">{len || 0} km</Tag>,
        },
        {
            title: 'Hạ Tầng Kỹ Thuật',
            key: 'infrastructure',
            render: (_: any, record: any) => (
                <Space>
                    <Tag color="purple">🌉 {record.bridgeCount || 0} Cầu</Tag>
                    <Tag color="volcano">🚇 {record.tunnelCount || 0} Hầm</Tag>
                    <Tag color="orange">🛣️ {record.interchangeCount || 0} Nút giao</Tag>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <Button type="primary" icon={<EyeOutlined />} size="small">Chi tiết</Button>
                    <Button type="default" icon={<EnvironmentOutlined />} size="small">Bản đồ</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* 📊 TẦNG 1: THẺ THỐNG KÊ BIẾN ĐỘNG THEO DATA THẬT */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng số phân đoạn</p>
                        <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold' }}>{totalSections} Tuyến</h2>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng chiều dài quản lý</p>
                        <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#52c41a' }}>{totalLength} km</h2>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <p style={{ color: '#8c8c8c', margin: 0 }}>Tổng số Công trình (Cầu / Hầm)</p>
                        <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: 'bold', color: '#1890ff' }}>{totalBridges} / {totalTunnels}</h2>
                    </Card>
                </Col>
            </Row>

            {/* 🔍 TẦNG 2: THANH TÌM KIẾM */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
                <Row justify="space-between" align="middle">
                    <Col span={8}>
                        <Input placeholder="Tìm kiếm tuyến đường, phân đoạn..." prefix={<SearchOutlined />} size="large" />
                    </Col>
                    <Col>
                        <Button type="primary" size="large" style={{ backgroundColor: '#237804', borderColor: '#237804' }}>
                            + Thêm Phân Đoạn Mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* 📄 TẦNG 3: BẢNG DỮ LIỆU */}
            <Card title="DANH SÁCH CÁC TUYẾN ĐƯỜNG CAO TỐC" style={{ borderRadius: '8px' }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default ExpresswayPage;
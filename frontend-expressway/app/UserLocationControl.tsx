'use client';

import React, { useState } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "./style.css";
import { Button, message } from 'antd';


const userLocationIcon = L.divIcon({
    className: 'user-location-marker-container',
    html: '<div class="user-location-marker"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

export default function UserLocationControl() {
    const map = useMap();
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [locating, setLocating] = useState(false);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            message.error('Trình duyệt của bạn không hỗ trợ chức năng định vị!');
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newCoords: [number, number] = [latitude, longitude];
                
                setPosition(newCoords);
                setLocating(false);
                message.success('Đã xác định vị trí hiện tại!');
                map.flyTo(newCoords, 15, {
                    animate: true,
                    duration: 1.5
                });
            },
            (error) => {
                setLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    message.error('Vui lòng cấp quyền truy cập vị trí trên trình duyệt.');
                } else {
                    message.error('Không thể xác định vị trí hiện tại.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 8000
            }
        );
    };

    return (
        <>
            {/* Nút bấm nổi trên bản đồ */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <Button 
                    type="primary" 
                    shape="round" 
                    icon={<span>📍</span>} 
                    loading={locating}
                    onClick={handleLocate}
                    style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontWeight: 'bold'
                    }}
                >
                    {locating ? 'Đang định vị...' : 'Vị trí của tôi'}
                </Button>
            </div>

            {/* Thả Marker nhấp nháy xanh tại vị trí người dùng */}
            {position && (
                <Marker position={position} icon={userLocationIcon}>
                    <Popup>
                        <div style={{ textAlign: 'center', fontWeight: 'semibold' }}>
                            📍 Bạn đang ở đây!
                        </div>
                    </Popup>
                </Marker>
            )}
        </>
    );
}
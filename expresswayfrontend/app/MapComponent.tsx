'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';

interface MapProps {
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
    geojsonData: any;
}

function MapController({
    isFullscreen,
    geojsonData,
}: {
    isFullscreen: boolean;
    geojsonData: any;
}) {
    const map = useMap();

    // Tự động căn màn hình (fitBounds) ôm trọn tuyến đường dựa trên tọa độ thực tế
    useEffect(() => {
        if (!map || !geojsonData) return;
        try {
            const L = require('leaflet');
            const layer = L.geoJSON(geojsonData);
            map.fitBounds(layer.getBounds(), {
                padding: [40, 40],
            });
        } catch (err) {
            console.error('Fit bounds error:', err);
        }
    }, [geojsonData, map]);

    // Fix lỗi hiển thị khi bật/tắt Fullscreen
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400);

        return () => clearTimeout(timer);
    }, [isFullscreen, map]);

    return null;
}

export default function MapComponent({
    isFullscreen,
    setIsFullscreen,
    geojsonData,
}: MapProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen, setIsFullscreen]);

    return (
        <MapContainer
            center={[20.8348, 105.884]}
            zoom={11}
            style={{
                height: '100%',
                width: '100%',
            }}
            zoomControl={isFullscreen}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* THAY ĐỔI CHÍNH: Vẽ trực tiếp GeoJSON, chấm đâu dây nằm đó, ôm khít theo làn đường bạn chọn */}
            {geojsonData && (
                <GeoJSON
                    key={JSON.stringify(geojsonData)} // Ép render lại khi dữ liệu tọa độ thay đổi
                    data={geojsonData}
                    style={{
                        color: '#059731', // Màu xanh lá của bạn
                        opacity: 0.8,
                        weight: 6,
                        lineCap: 'round',  // Bo tròn đầu đoạn thẳng
                        lineJoin: 'round'  // Bo tròn các góc bẻ khúc
                    }}
                />
            )}

            <MapController
                isFullscreen={isFullscreen}
                geojsonData={geojsonData}
            />

            {isFullscreen && (
                <button
                    className="esc"
                    onClick={() => setIsFullscreen(false)}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1000,
                        padding: '10px 16px',
                        background: 'white',
                        border: '2px solid black',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '4px',
                    }}
                >
                    ESC
                </button>
            )}
        </MapContainer>
    );
}
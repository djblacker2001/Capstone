'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import UserLocationControl from './UserLocationControl';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
interface MapProps {
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
    mapDataFromApi?: any;
}

function MapController({
    isFullscreen,
    geojsonData,
}: {
    isFullscreen: boolean;
    geojsonData: any;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map || !geojsonData) return;
        try {
            const L = require('leaflet');
            const layer = L.geoJSON(geojsonData);
            const bounds = layer.getBounds();

            if (bounds.isValid()) {
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 14,
                    animate: true,
                    duration: 1,
                });
            }
        } catch (err) {
            console.error('Lỗi khi fitBounds bản đồ:', err);
        }
    }, [geojsonData, map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);

        return () => clearTimeout(timer);
    }, [isFullscreen, map]);

    return null;
}

export default function MapComponent({
    isFullscreen,
    setIsFullscreen,
    mapDataFromApi,
}: MapProps) {
    const [currentGeojson, setCurrentGeojson] = useState<any>(null);
    useEffect(() => {
        const loadGeojsonData = async () => {
            if (!mapDataFromApi) {
                setCurrentGeojson(null);
                return;
            }

            if (typeof mapDataFromApi === 'string') {
                if (mapDataFromApi.trim().startsWith('{') || mapDataFromApi.trim().startsWith('[')) {
                    try {
                        setCurrentGeojson(JSON.parse(mapDataFromApi));
                    } catch (e) {
                        console.error("❌ Lỗi parse JSON String:", e);
                        setCurrentGeojson(null);
                    }
                } else {
                    const fileUrl = mapDataFromApi.startsWith('http')
                        ? mapDataFromApi
                        : `${baseUrl}/${mapDataFromApi.replace(/^\//, '')}`;

                    try {
                        console.log("📥 Đang tải file GeoJSON từ URL:", fileUrl);
                        const res = await axios.get(fileUrl);
                        setCurrentGeojson(res.data);
                    } catch (err) {
                        console.error("❌ Lỗi tải file GeoJSON từ URL:", fileUrl, err);
                        setCurrentGeojson(null);
                    }
                }
            }

            else if (typeof mapDataFromApi === 'object') {
                setCurrentGeojson(mapDataFromApi);
            }
        };

        loadGeojsonData();
    }, [mapDataFromApi]);

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
            center={[16.047079, 108.20623]}
            zoom={6}
            style={{
                height: '100%',
                width: '100%',
            }}
            zoomControl={isFullscreen}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {currentGeojson && (
                <GeoJSON
                    key={JSON.stringify(currentGeojson)}
                    data={currentGeojson}
                    style={{
                        color: '#0A9646',
                        opacity: 0.9,
                        weight: 6,
                        lineCap: 'round',
                        lineJoin: 'round',
                    }}
                />
            )}

            <MapController
                isFullscreen={isFullscreen}
                geojsonData={currentGeojson}
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
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        color: '#262626',
                    }}
                >
                    ESC
                </button>
            )}

            <UserLocationControl />
        </MapContainer>
    );
}
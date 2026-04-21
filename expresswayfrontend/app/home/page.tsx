'use client';

import { Card } from 'antd';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MainLayout from '../layout/Layout';

export default function MapCard() {

    useEffect(() => {
        const map = L.map('map').setView([10.7769, 106.7009], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        return () => {
            map.remove(); // tránh bug khi reload
        };
    }, []);

    return (
        <MainLayout>
            <Card title="Bản đồ" style={{ width: 600, margin: '40px auto' }}>
                <div id="map" style={{ height: 300, borderRadius: 10 }}></div>
            </Card>
        </MainLayout>
    );
}
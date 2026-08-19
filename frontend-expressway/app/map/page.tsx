'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import Header from '../components/Header/Header';
import "./map.css"
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
            <Spin size="large" tip="Loading map..." />
        </div>
    ),
});

export default function MapPage() {
    return (
        <ProtectedRoute>
            <Header />
            <div style={{ width: '100vw', height: '880px', margin: 0, padding: 0, overflowY: 'hidden', position: 'relative', marginTop: '50px' }}>
                <MapComponent />
            </div>
        </ProtectedRoute>

    );
}
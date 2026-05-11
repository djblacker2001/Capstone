'use client';

import { Card } from 'antd';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MainLayout from '../layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import "./style.css"

export default function MapCard() {

    return (
        <ProtectedRoute>
            <MainLayout>
                <></>
            </MainLayout>
        </ProtectedRoute>
    );
}
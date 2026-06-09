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
                <div className="slide-container" id="slide9">
                    <h2 className="slide-title">API Documentation & UI/UX Vision</h2>
                    <div className="content-area">
                        <div className="tiled-content">
                            <div className="image-tile" style={{ borderTop: '4px solid #38bdf8' }}>
                                <div className="image-wrapper">

                                    <img
                                        src="https://placehold.co/600x400/0f172a/f8fafc?text=Your+NestJS+Swagger+UI+Screenshot"
                                        alt="Swagger API Documentation Screenshot"
                                    />
                                </div>
                                <h3>Interactive API Spec (Swagger)</h3>
                                <div className="ux-flow">
                                    <span>Current Achievement:</span>
                                    <p>Fully documented RESTful APIs with <strong>OpenAPI (Swagger)</strong>. Allows the Council to test live endpoints, DTO validation, and JSON responses directly.</p>
                                </div>
                            </div>

                            <div className="image-tile" style={{ borderTop: '4px solid #64748b' }}>
                                <div className="image-wrapper">
                                    <img
                                        src="https://placehold.co/600x400/ffffff/000000?text=Future+Next.js+Dashboard+Wireframe"
                                        alt="Future Frontend Wireframe"
                                    />
                                </div>
                                <h3>Future Frontend Wireframes</h3>
                                <div className="ux-flow">
                                    <span>Capstone 2 Vision:</span>
                                    <p>Admin Control Panel (Asset CRUD, Section Management) & Public Information Portal (No-login route for tracking signs and road safety status).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
}
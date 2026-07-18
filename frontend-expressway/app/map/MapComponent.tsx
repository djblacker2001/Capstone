'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { message, Spin } from 'antd';
import 'leaflet/dist/leaflet.css';


const userLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'user-location-marker-container',
  html: '<div class="user-location-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
}) : null;

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt của bạn không hỗ trợ định vị.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (res) => {
        const { latitude, longitude } = res.coords;
        setPosition([latitude, longitude]);
        setLoadingLocation(false);
      },
      (error) => {
        console.error(error);
        setPosition([10.7626, 106.6602]); 
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (loadingLocation || !position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Spin size="large" tip="Đang xác định vị trí thực tế của bạn..." />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <MapContainer 
        center={position} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapCenter center={position} />

        {userLocationIcon && (
          <Marker position={position} icon={userLocationIcon}>
            <Popup>
              <div style={{ fontWeight: '500' }}>📍 Vị trí của bạn</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
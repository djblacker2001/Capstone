'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
interface MapProps {
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  geojsonData: any;
}

function MapFitBounds({ geojsonData }: { geojsonData: any }) {
  const map = useMap();

  useEffect(() => {
    if (!geojsonData || typeof window === 'undefined') return;

    try {
      const L = require('leaflet');
      const geoJsonLayer = L.geoJSON(geojsonData);
      const bounds = geoJsonLayer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (err) {
      console.error('Fit bounds error:', err);
    }
  }, [geojsonData, map]);

  return null;
}

function MapResizeController({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

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
  const [actualGeoJson, setActualGeoJson] = useState<any>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen]);
  useEffect(() => {
    if (typeof geojsonData === 'string' && geojsonData.trim() !== '') {

      const url = geojsonData.startsWith('http') ? geojsonData : `${baseUrl}/${geojsonData}`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data) => {
          setActualGeoJson(data);
        })
        .catch((err) => console.error('Failed to load GeoJSON map file:', err));
    } else if (geojsonData && typeof geojsonData === 'object') {
      setActualGeoJson(geojsonData);
    }
  }, [geojsonData]);

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
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {actualGeoJson && <MapFitBounds geojsonData={actualGeoJson} />}
      <MapResizeController isFullscreen={isFullscreen} />
      {actualGeoJson && (
        <GeoJSON
          key={JSON.stringify(actualGeoJson)}
          data={actualGeoJson}
          style={() => ({
            color: '#ff3838',
            weight: 6,
            opacity: 0.85,
          })}
        />
      )}

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
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  geojsonData: any;
}

function MapController({ isFullscreen, geojsonData }: { isFullscreen: boolean; geojsonData: any }) {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined' || !map || !geojsonData) return;
    const L = require('leaflet');
    window.L = L;
    require('leaflet-routing-machine');

    const coords = geojsonData.geometry.coordinates;
    const startPt = L.latLng(coords[0][1], coords[0][0]);
    const endPt = L.latLng(coords[1][1], coords[1][0]);

    const routingOptions: any = {
      waypoints: [startPt, endPt],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      createMarker: () => L.layerGroup([]),
      lineOptions: {
        styles: [{ color: '#ff3838', opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      }
    };

    const routingControl = (L as any).Routing.control(routingOptions).addTo(map);

    routingControl.on('routesfound', function (e: any) {
      const routes = e.routes;
      const bounds = L.latLngBounds(routes[0].coordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    });

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, geojsonData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400);
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
}

export default function MapComponent({ isFullscreen, setIsFullscreen, geojsonData }: MapProps) {
  return (
    <MapContainer
      center={[20.8348, 105.8840]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={isFullscreen}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController isFullscreen={isFullscreen} geojsonData={geojsonData} />

      {isFullscreen && (
        <button
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
            borderRadius: '4px'
          }}
        >
          THU NHỎ ✖
        </button>
      )}
    </MapContainer>
  );
}
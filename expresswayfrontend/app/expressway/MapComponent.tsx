'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !map) return;

    const L = require('leaflet');
    (window as any).L = L;
    require('leaflet-routing-machine');

    routingRef.current = (L as any).Routing.control({
      waypoints: [],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,

      createMarker: () => null,

      lineOptions: {
        styles: [
          {
            color: '#ff3838',
            opacity: 0.8,
            weight: 6,
          },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 100,
      },
    }).addTo(map);

    routingRef.current.on('routesfound', (e: any) => {
      if (!e.routes?.length) return;

      const bounds = L.latLngBounds(
        e.routes[0].coordinates
      );

      map.fitBounds(bounds, {
        padding: [20, 20],
      });
    });

    return () => {
      try {
        routingRef.current?.off();
        routingRef.current?.remove();
        routingRef.current = null;
      } catch (err) {
        console.error('Routing cleanup error:', err);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!routingRef.current || !geojsonData) return;

    try {
      const L = require('leaflet');

      const coords = geojsonData?.geometry?.coordinates;

      if (!coords || coords.length < 2) return;

      const startPoint = L.latLng(
        coords[0][1],
        coords[0][0]
      );

      const endPoint = L.latLng(
        coords[coords.length - 1][1],
        coords[coords.length - 1][0]
      );

      routingRef.current.setWaypoints([
        startPoint,
        endPoint,
      ]);
    } catch (err) {
      console.error('Update route error:', err);
    }
  }, [geojsonData]);

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
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
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
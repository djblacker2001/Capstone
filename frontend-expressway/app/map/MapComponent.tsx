'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { message, Spin, Select, Space, Card, Tag } from 'antd';
import 'leaflet/dist/leaflet.css';
import { BranchesOutlined, CoffeeOutlined, EnvironmentOutlined } from '@ant-design/icons';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Custom Icon cho Leaflet
const createCustomIcon = (iconHtml: string, className: string = '') => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: `custom-map-icon ${className}`,
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const userLocationIcon = typeof window !== 'undefined' ? L.divIcon({
  className: 'user-location-marker-container',
  html: '<div class="user-location-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
}) : null;

// Icon riêng cho Nút giao và Trạm dừng
const interchangeIcon = createCustomIcon('<div style="background:#1890ff;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">🔀</div>');
const restStopIcon = createCustomIcon('<div style="background:#52c41a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">☕</div>');

// Controller hỗ trợ thay đổi vị trí + zoom bản đồ mượt mà
function ChangeMapCenter({ center, zoom = 14 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Controller tự động căn vừa khung hình (Fit Bounds) khi có GeoJSON
function GeoJSONFitter({ geojsonData }: { geojsonData: any }) {
  const map = useMap();
  useEffect(() => {
    if (geojsonData) {
      try {
        const geoJsonLayer = L.geoJSON(geojsonData);
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [30, 30] });
      } catch (err) {
        console.error("Lỗi parse GeoJSON bounds:", err);
      }
    }
  }, [geojsonData, map]);
  return null;
}

interface MapProps {
  isFullscreen?: boolean;
  setIsFullscreen?: (val: boolean) => void;
  geojsonData?: string; // Link file json
}

export default function MapComponent({ geojsonData }: MapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(14);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // State các bộ lọc Select
  const [selectedExpressway, setSelectedExpressway] = useState<string | null>('CT01');
  const [selectedSection, setSelectedSection] = useState<number | null>(101);
  const [selectedInterchange, setSelectedInterchange] = useState<number | null>(null);
  const [selectedRestStop, setSelectedRestStop] = useState<number | null>(null);

  // Mock Danh sách Tuyến đường
  const expressways = [
    { label: 'Cao tốc Bắc - Nam (CT.01)', value: 'CT01' },
    { label: 'Cao tốc Hà Nội - Hải Phòng (CT.04)', value: 'CT04' }
  ];

  // Mock Danh sách Phân đoạn
  const sections = [
    { id: 101, name: "Pháp Vân – Cầu Giẽ", lat: 20.832, lng: 105.882, jsonUrl: "uploads/maps/phapvancaugie.json" },
    { id: 102, name: "Cầu Giẽ – Ninh Bình", lat: 20.571, lng: 105.951, jsonUrl: "uploads/maps/caugieninhbinh.json" }
  ];

  // Mock Danh sách Nút giao & Trạm dừng từ API
  const interchanges = [
    { id: 10101, name: "Nút giao Pháp Vân", km: "182", lat: 20.961243, lng: 105.849085, type: "Trumpet", connection: "Vành Đai 3" },
    { id: 10104, name: "Nút giao Thường Tín", km: "192.7", lat: 20.870341, lng: 105.879758, type: "Diamond", connection: "ĐT427" },
    { id: 10105, name: "Nút giao Vạn Điểm", km: "203.7", lat: 20.772520, lng: 105.908351, type: "Diamond", connection: "ĐT429" },
    { id: 10106, name: "Nút giao Đại Xuyên", km: "211.7", lat: 20.703974, lng: 105.918850, type: "Trumpet", connection: "AH1, ĐT428" }
  ];

  const restStops = [
    { id: 1021, name: "Trạm dừng Tiên Hiệp (S-N)", km: "227.7", lat: 20.571427, lng: 105.952207, services: ["Cây xăng", "Ăn uống", "Vệ sinh"] },
    { id: 1022, name: "Trạm dừng Tiên Hiệp (N-S)", km: "227.7", lat: 20.571987, lng: 105.950455, services: ["Cây xăng", "Ăn uống", "Vệ sinh"] }
  ];

  // 1. Định vị người dùng
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
        setTargetCenter([latitude, longitude]);
        setLoadingLocation(false);
      },
      () => {
        const defaultPos: [number, number] = [20.961243, 105.849085];
        setPosition(defaultPos);
        setTargetCenter(defaultPos);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 2. Fetch GeoJSON đường cao tốc khi chọn phân đoạn hoặc truyền từ props
  useEffect(() => {
    const jsonPath = geojsonData || "uploads/maps/phapvancaugie.json";
    if (jsonPath) {
      fetch(`${baseUrl}/${jsonPath}`)
        .then(res => res.json())
        .then(data => setGeoJsonData(data))
        .catch(err => console.error("Không thể tải file GeoJSON:", err));
    }
  }, [geojsonData, selectedSection]);

  // Handlers khi chọn Select
  const handleSelectSection = (val: number) => {
    setSelectedSection(val);
    setSelectedInterchange(null);
    setSelectedRestStop(null);
    const sec = sections.find(s => s.id === val);
    if (sec) {
      setTargetCenter([sec.lat, sec.lng]);
      setTargetZoom(12);
    }
  };

  const handleSelectInterchange = (val: number) => {
    setSelectedInterchange(val);
    setSelectedRestStop(null);
    const ic = interchanges.find(i => i.id === val);
    if (ic && ic.lat && ic.lng) {
      setTargetCenter([ic.lat, ic.lng]);
      setTargetZoom(16);
    }
  };

  const handleSelectRestStop = (val: number) => {
    setSelectedRestStop(val);
    setSelectedInterchange(null);
    const rs = restStops.find(r => r.id === val);
    if (rs && rs.lat && rs.lng) {
      setTargetCenter([rs.lat, rs.lng]);
      setTargetZoom(16);
    }
  };

  if (loadingLocation || !position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Spin size="large" tip="Đang khởi tạo bản đồ..." />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Control Panel Nằm Đè Lên Bản Đồ */}
      <Card
        size="small"
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          maxWidth: 'calc(100% - 24px)'
        }}
      >
        <Space wrap size="small">
          {/* Select Tuyến đường */}
          <Select
            style={{ width: 180 }}
            placeholder="Chọn tuyến đường"
            value={selectedExpressway}
            onChange={(val) => setSelectedExpressway(val)}
            options={expressways}
          />

          {/* Select Phân đoạn */}
          <Select
            style={{ width: 170 }}
            placeholder="Chọn đoạn đường"
            value={selectedSection}
            onChange={handleSelectSection}
            options={sections.map(s => ({ label: s.name, value: s.id }))}
          />

          {/* Select Nút giao */}
          <Select
            allowClear
            style={{ width: 180 }}
            placeholder="🔀 Chọn nút giao"
            value={selectedInterchange}
            onChange={handleSelectInterchange}
            options={interchanges.map(i => ({ label: `${i.name} (Km ${i.km})`, value: i.id }))}
          />

          {/* Select Trạm dừng nghỉ */}
          <Select
            allowClear
            style={{ width: 180 }}
            placeholder="☕ Chọn trạm dừng"
            value={selectedRestStop}
            onChange={handleSelectRestStop}
            options={restStops.map(r => ({ label: r.name, value: r.id }))}
          />
        </Space>
      </Card>

      {/* Bản đồ Leaflet */}
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

        {/* Điều khiển chuyển góc nhìn */}
        {targetCenter && <ChangeMapCenter center={targetCenter} zoom={targetZoom} />}
        {geoJsonData && <GeoJSONFitter geojsonData={geoJsonData} />}

        {/* Vẽ tuyến đường GeoJSON */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={{ color: '#ff4d4f', weight: 5, opacity: 0.8 }}
          />
        )}

        {/* Marker vị trí người dùng */}
        {userLocationIcon && (
          <Marker position={position} icon={userLocationIcon}>
            <Popup>
              <div style={{ fontWeight: '600' }}>📍 Vị trí hiện tại của bạn</div>
            </Popup>
          </Marker>
        )}

        {/* Markers các Nút giao */}
        {interchanges.map((ic) => (
          ic.lat && ic.lng && (
            <Marker
              key={`ic-${ic.id}`}
              position={[ic.lat, ic.lng]}
              icon={interchangeIcon!}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <Tag color="blue" icon={<BranchesOutlined />}>Nút giao</Tag>
                  <h4 style={{ margin: '6px 0 2px 0' }}>{ic.name}</h4>
                  <div><b>Vị trí:</b> Km {ic.km}</div>
                  <div><b>Kết nối:</b> {ic.connection}</div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Markers các Trạm dừng nghỉ */}
        {restStops.map((rs) => (
          rs.lat && rs.lng && (
            <Marker
              key={`rs-${rs.id}`}
              position={[rs.lat, rs.lng]}
              icon={restStopIcon!}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <Tag color="green" icon={<CoffeeOutlined />}>Trạm dừng nghỉ</Tag>
                  <h4 style={{ margin: '6px 0 2px 0' }}>{rs.name}</h4>
                  <div><b>Vị trí:</b> Km {rs.km}</div>
                  <div style={{ marginTop: 4 }}>
                    {rs.services.map((s, idx) => (
                      <Tag key={idx} color="geekblue" style={{ fontSize: 10 }}>{s}</Tag>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
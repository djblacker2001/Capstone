'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { message, Spin, Select, Space, Card, Tag } from 'antd';
import 'leaflet/dist/leaflet.css';
import { BranchesOutlined, CoffeeOutlined } from '@ant-design/icons';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Custom Marker Icons
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

const interchangeIcon = createCustomIcon('<div style="background:#1890ff;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">🔀</div>');
const restStopIcon = createCustomIcon('<div style="background:#52c41a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">☕</div>');

// Component di chuyển tâm bản đồ mượt mà
function ChangeMapCenter({ center, zoom = 12 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Component render GeoJSON riêng biệt - Giải quyết dứt điểm lỗi đè Layer cũ
function GeoJsonLayerWrapper({ data, sectionId }: { data: any; sectionId: number }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    // Tạo GeoJSON layer tạm để tính Bounds
    try {
      const tempLayer = L.geoJSON(data);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (e) {
      console.error("Lỗi fitBounds GeoJSON:", e);
    }
  }, [data, map]);

  if (!data) return null;

  return (
    <GeoJSON
      key={`geojson-section-${sectionId}`}
      data={data}
      style={{ color: '#ff4d4f', weight: 6, opacity: 0.85 }}
    />
  );
}

// Interfaces
interface SectionItem {
  SectionId: number;
  ExpresswayId: number;
  NameSection: string;
  MapData: string;
  lat: number;
  lng: number;
}

interface InterchangeItem {
  InterchangeId: number;
  SectionId: number;
  NameInterchange: string;
  Location: string;
  Latitude: number;
  Longitude: number;
  Type: string;
  Connection: string;
}

interface RestStopItem {
  RestStopId: number;
  SectionId: number;
  NameRestStop: string;
  Location: string;
  Latitude: number;
  Longitude: number;
  HasPetrol: boolean;
  HasFood: boolean;
  HasToilet: boolean;
}

export default function MapComponent() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(12);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Filter States
  const [selectedExpressway, setSelectedExpressway] = useState<string>('CT01');
  const [selectedSection, setSelectedSection] = useState<number>(101);
  const [selectedInterchange, setSelectedInterchange] = useState<number | null>(null);
  const [selectedRestStop, setSelectedRestStop] = useState<number | null>(null);

  // Mock Data Phân đoạn (Đã bổ sung lat/lng tâm đoạn đường)
  const sections: SectionItem[] = [
    {
      SectionId: 101,
      ExpresswayId: 100,
      NameSection: "Pháp Vân – Cầu Giẽ",
      MapData: "uploads/maps/phapvancaugie.json",
      lat: 20.8320,
      lng: 105.8820
    },
    {
      SectionId: 102,
      ExpresswayId: 100,
      NameSection: "Cầu Giẽ – Ninh Bình",
      MapData: "uploads/maps/caugieninhbinh.json",
      lat: 20.4500,
      lng: 105.9800
    }
  ];

  // Mock Nút giao (Phân chia theo SectionId)
  const allInterchanges: InterchangeItem[] = [
    // Đoạn 101: Pháp Vân - Cầu Giẽ
    { InterchangeId: 10101, SectionId: 101, NameInterchange: "Nút giao Pháp Vân", Location: "182", Latitude: 20.961243, Longitude: 105.849085, Type: "Trumpet", Connection: "Vành Đai 3" },
    { InterchangeId: 10104, SectionId: 101, NameInterchange: "Nút giao Thường Tín", Location: "192.7", Latitude: 20.870341, Longitude: 105.879758, Type: "Diamond", Connection: "ĐT427" },
    { InterchangeId: 10106, SectionId: 101, NameInterchange: "Nút giao Đại Xuyên", Location: "211.7", Latitude: 20.703974, Longitude: 105.918850, Type: "Trumpet", Connection: "AH1, ĐT428" },

    // Đoạn 102: Cầu Giẽ - Ninh Bình
    { InterchangeId: 10201, SectionId: 102, NameInterchange: "Nút giao Vực Vòng", Location: "218.6", Latitude: 20.648011, Longitude: 105.937210, Type: "Diamond", Connection: "QL38" },
    { InterchangeId: 10202, SectionId: 102, NameInterchange: "Nút giao Liêm Tuyền", Location: "230.5", Latitude: 20.536120, Longitude: 105.952800, Type: "Trumpet", Connection: "QL21B" },
    { InterchangeId: 10203, SectionId: 102, NameInterchange: "Nút giao Cao Bồ", Location: "260.0", Latitude: 20.315600, Longitude: 106.012500, Type: "Trumpet", Connection: "QL10" }
  ];

  // Mock Trạm dừng nghỉ (Phân chia theo SectionId)
  const allRestStops: RestStopItem[] = [
    { RestStopId: 1021, SectionId: 101, NameRestStop: "Trạm dừng Tiên Hiệp (S-N)", Location: "227.7", Latitude: 20.571427, Longitude: 105.952207, HasPetrol: true, HasFood: true, HasToilet: true },
    { RestStopId: 1022, SectionId: 102, NameRestStop: "Trạm dừng Ninh Bình (S-N)", Location: "255.0", Latitude: 20.352100, Longitude: 106.001200, HasPetrol: true, HasFood: true, HasToilet: true }
  ];

  // Lọc danh sách Nút giao & Trạm dừng theo Phân đoạn đang chọn
  const currentInterchanges = allInterchanges.filter(i => i.SectionId === selectedSection);
  const currentRestStops = allRestStops.filter(r => r.SectionId === selectedSection);

  // Định vị GPS ban đầu
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (res) => {
        const { latitude, longitude } = res.coords;
        setPosition([latitude, longitude]);
        setLoadingLocation(false);
      },
      () => {
        setPosition([20.961243, 105.849085]);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // Tải file GeoJSON mỗi khi `selectedSection` thay đổi
  useEffect(() => {
    const sec = sections.find(s => s.SectionId === selectedSection);
    if (!sec) return;

    // Reset dữ liệu GeoJSON cũ ngay lập tức
    setGeoJsonData(null);

    // Fetch file mới
    fetch(`${baseUrl}/${sec.MapData}`)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy file GeoJSON");
        return res.json();
      })
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(err => {
        console.error("Lỗi khi tải GeoJSON:", err);
      });
  }, [selectedSection]);

  // Handler chọn Phân đoạn
  const handleSelectSection = (sectionId: number) => {
    setSelectedSection(sectionId);
    setSelectedInterchange(null);
    setSelectedRestStop(null);

    const sec = sections.find(s => s.SectionId === sectionId);
    if (sec) {
      setTargetCenter([sec.lat, sec.lng]);
      setTargetZoom(11);
    }
  };

  // Handler chọn Nút giao
  const handleSelectInterchange = (id: number) => {
    setSelectedInterchange(id);
    setSelectedRestStop(null);
    const ic = allInterchanges.find(i => i.InterchangeId === id);
    if (ic) {
      setTargetCenter([ic.Latitude, ic.Longitude]);
      setTargetZoom(15);
    }
  };

  // Handler chọn Trạm dừng
  const handleSelectRestStop = (id: number) => {
    setSelectedRestStop(id);
    setSelectedInterchange(null);
    const rs = allRestStops.find(r => r.RestStopId === id);
    if (rs) {
      setTargetCenter([rs.Latitude, rs.Longitude]);
      setTargetZoom(15);
    }
  };

  if (loadingLocation || !position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Spin size="large" tip="Đang tải bản đồ..." />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Bộ lọc thanh công cụ trên Bản đồ */}
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
          borderRadius: '8px'
        }}
      >
        <Space wrap size="small">
          {/* Tuyến đường */}
          <Select
            style={{ width: 170 }}
            value={selectedExpressway}
            onChange={setSelectedExpressway}
            options={[{ label: 'Cao tốc Bắc - Nam (CT.01)', value: 'CT01' }]}
          />

          {/* Đoạn đường */}
          <Select
            style={{ width: 180 }}
            placeholder="Chọn đoạn đường"
            value={selectedSection}
            onChange={handleSelectSection}
            options={sections.map(s => ({ label: s.NameSection, value: s.SectionId }))}
          />

          {/* Nút giao */}
          <Select
            allowClear
            style={{ width: 180 }}
            placeholder="🔀 Chọn nút giao"
            value={selectedInterchange}
            onChange={handleSelectInterchange}
            options={currentInterchanges.map(i => ({ label: `${i.NameInterchange} (Km ${i.Location})`, value: i.InterchangeId }))}
          />

          {/* Trạm dừng */}
          <Select
            allowClear
            style={{ width: 180 }}
            placeholder="☕ Chọn trạm dừng"
            value={selectedRestStop}
            onChange={handleSelectRestStop}
            options={currentRestStops.map(r => ({ label: r.NameRestStop, value: r.RestStopId }))}
          />
        </Space>
      </Card>

      {/* Bản đồ Leaflet */}
      <MapContainer
        center={position}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Điều khiển đổi góc nhìn bản đồ */}
        {targetCenter && <ChangeMapCenter center={targetCenter} zoom={targetZoom} />}

        {/* Render tuyến đường GeoJSON bằng Component riêng */}
        <GeoJsonLayerWrapper data={geoJsonData} sectionId={selectedSection} />

        {/* Marker vị trí người dùng */}
        {userLocationIcon && (
          <Marker position={position} icon={userLocationIcon}>
            <Popup>📍 Vị trí hiện tại của bạn</Popup>
          </Marker>
        )}

        {/* Markers các Nút giao thuộc phân đoạn đang chọn */}
        {currentInterchanges.map((ic) => (
          <Marker
            key={`ic-${ic.InterchangeId}`}
            position={[ic.Latitude, ic.Longitude]}
            icon={interchangeIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="blue" icon={<BranchesOutlined />}>Nút giao</Tag>
                <h4 style={{ margin: '6px 0 2px 0' }}>{ic.NameInterchange}</h4>
                <div><b>Vị trí:</b> Km {ic.Location}</div>
                <div><b>Kết nối:</b> {ic.Connection}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Markers các Trạm dừng thuộc phân đoạn đang chọn */}
        {currentRestStops.map((rs) => (
          <Marker
            key={`rs-${rs.RestStopId}`}
            position={[rs.Latitude, rs.Longitude]}
            icon={restStopIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="green" icon={<CoffeeOutlined />}>Trạm dừng nghỉ</Tag>
                <h4 style={{ margin: '6px 0 2px 0' }}>{rs.NameRestStop}</h4>
                <div><b>Vị trí:</b> Km {rs.Location}</div>
                <Space wrap style={{ marginTop: 4 }}>
                  {rs.HasPetrol && <Tag color="orange">⛽ Cây xăng</Tag>}
                  {rs.HasFood && <Tag color="blue">🍽️ Ăn uống</Tag>}
                  {rs.HasToilet && <Tag color="cyan">🚾 Vệ sinh</Tag>}
                </Space>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
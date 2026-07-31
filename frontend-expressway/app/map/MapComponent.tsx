'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Spin, Select, Space, Card, Tag, Button, Drawer, Grid, Image, Divider, Typography } from 'antd';
import 'leaflet/dist/leaflet.css';
import { BranchesOutlined, CoffeeOutlined, FilterOutlined, PartitionOutlined, DashboardOutlined, CompassOutlined, } from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const createCustomIcon = (iconHtml: string, className: string = '') => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: `custom-map-icon ${className}`,
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const userLocationIcon =
  typeof window !== 'undefined'
    ? L.divIcon({
      className: 'user-location-marker-container',
      html: '<div class="user-location-marker" style="background:#1890ff;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(24,144,255,0.8);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
    : null;

const interchangeIcon = createCustomIcon(
  '<div style="background:#1890ff;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">🔀</div>'
);
const restStopIcon = createCustomIcon(
  '<div style="background:#52c41a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:14px;">☕</div>'
);

const createSpeedSignIcon = (imgUrl: string, size: number = 36) => {
  return createCustomIcon(
    `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;border:2px solid #ff4d4f;box-shadow:0 2px 6px rgba(0,0,0,0.4);background:white;">
      <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" alt="Speed Sign"/>
    </div>`
  );
};


function ChangeMapCenter({ center, zoom = 12 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function GeoJsonLayerWrapper({ data, keyId }: { data: any; keyId: string | number }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    try {
      const tempLayer = L.geoJSON(data);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      console.error('Lỗi fitBounds GeoJSON:', e);
    }
  }, [data, map]);

  if (!data) return null;

  return (
    <GeoJSON
      key={`geojson-${keyId}`}
      data={data}
      style={{ color: '#ff4d4f', weight: 5, opacity: 0.85 }}
    />
  );
}

interface ExpresswayItem {
  ExpresswayId: number;
  NameExpressway: string;
  Symbol: string;
  Description: string;
  Tag: string;
  MapData: string;
}

interface SectionItem {
  SectionId: number;
  ExpresswayId: number;
  NameSection: string;
  MapData: string;
  lat: number;
  lng: number;
  speedLimit?: string;
  speedSign?: string;
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
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(12);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [expressways, setExpressways] = useState<ExpresswayItem[]>([]);
  const [selectedExpressway, setSelectedExpressway] = useState<number>(100);
  const [selectedSection, setSelectedSection] = useState<number | 'ALL'>('ALL');
  const [selectedInterchange, setSelectedInterchange] = useState<number | null>(null);
  const [selectedRestStop, setSelectedRestStop] = useState<number | null>(null);

  const sections: SectionItem[] = [
    {
      SectionId: 101,
      ExpresswayId: 100,
      NameSection: 'Pháp Vân – Cầu Giẽ',
      MapData: 'uploads/maps/phapvancaugie.json',
      lat: 20.832,
      lng: 105.882,
      speedLimit: 'Tối đa 100 km/h - Tối thiểu 60 km/h',
      speedSign: `uploads/signs/phapvancaugietocdo.png`,
    },
    {
      SectionId: 102,
      ExpresswayId: 100,
      NameSection: 'Cầu Giẽ – Ninh Bình',
      MapData: 'uploads/maps/caugieninhbinh.json',
      lat: 20.45,
      lng: 105.98,
      speedLimit: 'Tối đa 120 km/h - Tối thiểu 60 km/h',
      speedSign: `uploads/signs/tocdocao2lan.png`,
    },
  ];

  const allInterchanges: InterchangeItem[] = [
    { InterchangeId: 10101, SectionId: 101, NameInterchange: 'Nút giao Pháp Vân', Location: '182', Latitude: 20.961243, Longitude: 105.849085, Type: 'Trumpet', Connection: 'Vành Đai 3' },
    { InterchangeId: 10104, SectionId: 101, NameInterchange: 'Nút giao Thường Tín', Location: '192.7', Latitude: 20.870341, Longitude: 105.879758, Type: 'Diamond', Connection: 'ĐT427' },
    { InterchangeId: 10106, SectionId: 101, NameInterchange: 'Nút giao Đại Xuyên', Location: '211.7', Latitude: 20.703974, Longitude: 105.918850, Type: 'Trumpet', Connection: 'AH1, ĐT428' },
    { InterchangeId: 10201, SectionId: 102, NameInterchange: 'Nút giao Vực Vòng', Location: '218.6', Latitude: 20.648011, Longitude: 105.937210, Type: 'Diamond', Connection: 'QL38' },
    { InterchangeId: 10202, SectionId: 102, NameInterchange: 'Nút giao Liêm Tuyền', Location: '230.5', Latitude: 20.53612, Longitude: 105.9528, Type: 'Trumpet', Connection: 'QL21B' },
    { InterchangeId: 10203, SectionId: 102, NameInterchange: 'Nút giao Cao Bồ', Location: '260.0', Latitude: 20.3156, Longitude: 106.0125, Type: 'Trumpet', Connection: 'QL10' },
  ];

  const allRestStops: RestStopItem[] = [
    { RestStopId: 1021, SectionId: 101, NameRestStop: 'Trạm dừng Tiên Hiệp (S-N)', Location: '227.7', Latitude: 20.571427, Longitude: 105.952207, HasPetrol: true, HasFood: true, HasToilet: true },
    { RestStopId: 1022, SectionId: 102, NameRestStop: 'Trạm dừng Ninh Bình (S-N)', Location: '255.0', Latitude: 20.3521, Longitude: 106.0012, HasPetrol: true, HasFood: true, HasToilet: true },
  ];

  const currentInterchanges = selectedSection === 'ALL'
    ? allInterchanges
    : allInterchanges.filter((i) => i.SectionId === selectedSection);

  const currentRestStops = selectedSection === 'ALL'
    ? allRestStops
    : allRestStops.filter((r) => r.SectionId === selectedSection);

  const nearestInfo = useMemo(() => {
    if (!position) return null;

    const [uLat, uLng] = position;

    let nearestIC: { item: InterchangeItem; dist: number } | null = null;
    allInterchanges.forEach((ic) => {
      const d = calculateDistance(uLat, uLng, ic.Latitude, ic.Longitude);
      if (!nearestIC || d < nearestIC.dist) {
        nearestIC = { item: ic, dist: d };
      }
    });

    let nearestRS: { item: RestStopItem; dist: number } | null = null;
    allRestStops.forEach((rs) => {
      const d = calculateDistance(uLat, uLng, rs.Latitude, rs.Longitude);
      if (!nearestRS || d < nearestRS.dist) {
        nearestRS = { item: rs, dist: d };
      }
    });

    let nearestSec: { item: SectionItem; dist: number } | null = null;
    sections.forEach((sec) => {
      const d = calculateDistance(uLat, uLng, sec.lat, sec.lng);
      if (!nearestSec || d < nearestSec.dist) {
        nearestSec = { item: sec, dist: d };
      }
    });

    return { nearestIC, nearestRS, nearestSec };
  }, [position]);

  useEffect(() => {
    fetch(`${baseUrl}/expressways`)
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải danh sách cao tốc');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setExpressways(data);
        else if (Array.isArray(data?.data)) setExpressways(data.data);
        else setExpressways([]);
      })
      .catch((err) => {
        console.error('Lỗi fetch expressways:', err);
        setExpressways([]);
      });
  }, []);

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

  useEffect(() => {
    setGeoJsonData(null);
    let mapPath = '';

    if (selectedSection === 'ALL') {
      const currentEx = expressways.find((e) => e.ExpresswayId === selectedExpressway);
      mapPath = currentEx?.MapData || 'uploads/maps/EasternExpressway.json';
    } else {
      const sec = sections.find((s) => s.SectionId === selectedSection);
      if (sec) mapPath = sec.MapData;
    }

    if (!mapPath) return;

    fetch(`${baseUrl}/${mapPath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy file GeoJSON');
        return res.json();
      })
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Lỗi khi tải GeoJSON:', err));
  }, [selectedSection, selectedExpressway, expressways]);

  const handleSelectSection = (value: number | 'ALL') => {
    setSelectedSection(value);
    setSelectedInterchange(null);
    setSelectedRestStop(null);

    if (value !== 'ALL') {
      const sec = sections.find((s) => s.SectionId === value);
      if (sec) {
        setTargetCenter([sec.lat, sec.lng]);
        setTargetZoom(11);
      }
    }
    if (!screens.md) setDrawerOpen(false);
  };

  const handleSelectInterchange = (id: number) => {
    setSelectedInterchange(id);
    setSelectedRestStop(null);
    const ic = allInterchanges.find((i) => i.InterchangeId === id);
    if (ic) {
      setTargetCenter([ic.Latitude, ic.Longitude]);
      setTargetZoom(15);
    }
    if (!screens.md) setDrawerOpen(false);
  };

  const handleSelectRestStop = (id: number) => {
    setSelectedRestStop(id);
    setSelectedInterchange(null);
    const rs = allRestStops.find((r) => r.RestStopId === id);
    if (rs) {
      setTargetCenter([rs.Latitude, rs.Longitude]);
      setTargetZoom(15);
    }
    if (!screens.md) setDrawerOpen(false);
  };

  // Render Controls
  const renderFilterControls = () => (
    <Space direction={screens.md ? 'horizontal' : 'vertical'} style={{ width: '100%' }} size="small">
      <Select
        style={{ width: screens.md ? 200 : '100%' }}
        value={selectedExpressway}
        onChange={(val) => {
          setSelectedExpressway(val);
          setSelectedSection('ALL');
        }}
        options={
          expressways.length > 0
            ? expressways.map((e) => ({
              label: `${e.NameExpressway} (${e.Symbol})`,
              value: e.ExpresswayId,
            }))
            : [{ label: 'Cao tốc Bắc - Nam (CT.01)', value: 100 }]
        }
      />

      <Select
        style={{ width: screens.md ? 200 : '100%' }}
        placeholder="Chọn đoạn đường"
        value={selectedSection}
        onChange={handleSelectSection}
        options={[
          { label: '🌐 Tất cả tuyến đường', value: 'ALL' },
          ...sections.map((s) => ({ label: s.NameSection, value: s.SectionId })),
        ]}
      />

      <Select
        allowClear
        style={{ width: screens.md ? 180 : '100%' }}
        placeholder="🔀 Chọn nút giao"
        value={selectedInterchange}
        onChange={handleSelectInterchange}
        options={currentInterchanges.map((i) => ({
          label: `${i.NameInterchange} (Km ${i.Location})`,
          value: i.InterchangeId,
        }))}
      />

      <Select
        allowClear
        style={{ width: screens.md ? 180 : '100%' }}
        placeholder="☕ Chọn trạm dừng"
        value={selectedRestStop}
        onChange={handleSelectRestStop}
        options={currentRestStops.map((r) => ({
          label: r.NameRestStop,
          value: r.RestStopId,
        }))}
      />
    </Space>
  );

  if (loadingLocation || !position) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Spin size="large" tip="Đang tải bản đồ..." />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 50px)', position: 'relative', overflow: 'hidden' }}>
      {screens.md ? (
        <Card
          size="small"
          style={{
            position: 'absolute',
            top: 12,
            left: 50,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
          }}
        >
          {renderFilterControls()}
        </Card>
      ) : (
        <>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{
              position: 'absolute',
              top: 12,
              left: 50,
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            Bộ lọc
          </Button>

          <Drawer
            title="Bộ lọc bản đồ"
            placement="left"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={280}
          >
            {renderFilterControls()}
          </Drawer>
        </>
      )}

      {/* DASHBOARD: BẢNG THÔNG TIN CÁC ĐIỂM GẦN NHẤT */}
      {nearestInfo && (
        <Card
          size="small"
          title={
            <Space>
              <CompassOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: 13 }}>Gần bạn nhất</Text>
            </Space>
          }
          style={{
            position: 'absolute',
            bottom: 24,
            right: 12,
            zIndex: 1000,
            width: screens.md ? 300 : 260,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          {/* 1. Đoạn đường gần nhất */}
          {nearestInfo.nearestSec && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Tuyến đường gần nhất:</div>
              <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
                {(nearestInfo.nearestSec as any).item.NameSection}
              </Text>
              <div style={{ fontSize: 11, color: '#595959' }}>
                Cách khoảng: <b>{(nearestInfo.nearestSec as any).dist.toFixed(1)} km</b>
              </div>
            </div>
          )}

          <Divider style={{ margin: '6px 0' }} />

          {/* 2. Nút giao gần nhất */}
          {nearestInfo.nearestIC && (
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>🔀 Nút giao gần nhất:</div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>
                  {(nearestInfo.nearestIC as any).item.NameInterchange}
                </div>
                <div style={{ fontSize: 11, color: '#ff4d4f' }}>
                  Cách <b>{(nearestInfo.nearestIC as any).dist.toFixed(1)} km</b> (Km {(nearestInfo.nearestIC as any).item.Location})
                </div>
              </div>
              <Button
                type="primary"
                ghost
                shape="circle"
                size="small"
                icon={<PartitionOutlined />}
                onClick={() => {
                  const icItem = (nearestInfo.nearestIC as any).item;
                  setTargetCenter([icItem.Latitude, icItem.Longitude]);
                  setTargetZoom(15);
                }}
              />
            </div>
          )}

          <Divider style={{ margin: '6px 0' }} />

          {/* 3. Trạm dừng nghỉ gần nhất */}
          {nearestInfo.nearestRS && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>☕ Trạm dừng nghỉ gần nhất:</div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>
                  {(nearestInfo.nearestRS as any).item.NameRestStop}
                </div>
                <div style={{ fontSize: 11, color: '#52c41a' }}>
                  Cách <b>{(nearestInfo.nearestRS as any).dist.toFixed(1)} km</b> (Km {(nearestInfo.nearestRS as any).item.Location})
                </div>
              </div>
              <Button
                type="primary"
                ghost
                shape="circle"
                size="small"
                icon={<PartitionOutlined />}
                onClick={() => {
                  const rsItem = (nearestInfo.nearestRS as any).item;
                  setTargetCenter([rsItem.Latitude, rsItem.Longitude]);
                  setTargetZoom(15);
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* BẢN ĐỒ LEAFLET */}
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

        {targetCenter && <ChangeMapCenter center={targetCenter} zoom={targetZoom} />}

        {/* GeoJSON */}
        <GeoJsonLayerWrapper data={geoJsonData} keyId={selectedSection} />

        {/* Vị trí người dùng */}
        {userLocationIcon && (
          <Marker position={position} icon={userLocationIcon}>
            <Popup>
              <b>📍 Vị trí hiện tại của bạn</b>
            </Popup>
          </Marker>
        )}

        {/* Biển báo tốc độ giới hạn trên tuyến */}
        {/* Render biển báo tốc độ theo từng phân đoạn */}
        {sections.map((sec) => {
          // Tạo đường dẫn ảnh đầy đủ từ baseUrl và speedSign
          const signImageUrl = sec.speedSign = `${baseUrl}/${sec.speedSign}`

          return (
            <Marker
              key={`speed-sign-${sec.SectionId}`}
              position={[sec.lat, sec.lng]}
              icon={createSpeedSignIcon(signImageUrl)!}
            >
              <Popup>
                <div style={{ textAlign: 'center', minWidth: 160 }}>
                  <Tag color="red">BIỂN BÁO TỐC ĐỘ</Tag>
                  <h4 style={{ margin: '8px 0 4px 0' }}>{sec.NameSection}</h4>
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#555' }}>
                    <b>Quy định:</b> {sec.speedLimit || 'Tốc độ tối đa 120km/h'}
                  </p>
                  <Image
                    src={signImageUrl}
                    alt="Biển báo tốc độ"
                    width={140}
                    style={{ borderRadius: 6, border: '1px solid #eee', marginTop: 4 }}
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Các Nút Giao */}
        {currentInterchanges.map((ic) => (
          <Marker
            key={`ic-${ic.InterchangeId}`}
            position={[ic.Latitude, ic.Longitude]}
            icon={interchangeIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="blue" icon={<BranchesOutlined />}>
                  Nút giao
                </Tag>
                <h4 style={{ margin: '6px 0 2px 0' }}>{ic.NameInterchange}</h4>
                <div><b>Vị trí:</b> Km {ic.Location}</div>
                <div><b>Kết nối:</b> {ic.Connection}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Các Trạm Dừng nghỉ */}
        {currentRestStops.map((rs) => (
          <Marker
            key={`rs-${rs.RestStopId}`}
            position={[rs.Latitude, rs.Longitude]}
            icon={restStopIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="green" icon={<CoffeeOutlined />}>
                  Trạm dừng nghỉ
                </Tag>
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
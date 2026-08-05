'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Spin, Select, Space, Card, Tag, Button, Drawer, Grid, Image, Divider, Typography } from 'antd';
import 'leaflet/dist/leaflet.css';
import { BranchesOutlined, CoffeeOutlined, FilterOutlined, PartitionOutlined, CompassOutlined } from '@ant-design/icons';
import axiosClient from '@/api/axiosClient';
import { useTranslation } from 'react-i18next';

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

const getRouteColor = (status?: string) => {
  const statusVal = status?.toLowerCase().trim();

  switch (statusVal) {
    case 'complete':
    case 'Completed':
      return '#237804';

    case 'under construction':
    case 'construction':
      return '#1890ff';

    case 'extend under construction':
    case 'extend':
      return '#86c5ff';

    case 'not yet construction':
    case 'not_started':
    case 'planning':
      return '#faad14';

    case 'incident':
      return '#ff4d4f';

    case 'maintenance':
      return '#722ed1';

    default:
      return '#d9d9d9';
  }
};

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

function GeoJsonLayerWrapper({
  data,
  keyId,
  sections,
  status
}: {
  data: any;
  keyId: string | number;
  sections: SectionItem[];
  status?: string;
}) {
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

  const styleFeature = (feature: any) => {
    let currentStatus = status || feature?.properties?.status || feature?.properties?.Status;
    if (!currentStatus && sections && sections.length > 0) {
      const matchedSection = sections.find((s) => s.SectionId === keyId);
      if (matchedSection) {
        currentStatus = (matchedSection as any).Status || (matchedSection as any).status;
      }
    }

    return {
      color: getRouteColor(currentStatus),
      weight: 6,
      opacity: 0.85,
    };
  };

  return (
    <GeoJSON
      key={`geojson-${keyId}`}
      data={data}
      style={styleFeature}
    />
  );
}

function MultiSectionGeoJson({ sections, baseUrl }: { sections: SectionItem[]; baseUrl?: string }) {
  const [geoDataList, setGeoDataList] = useState<{ id: number; data: any; status?: string }[]>([]);

  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const fetchPromises = sections.map((sec) => {
      if (!sec.MapData) return Promise.resolve(null);
      const url = sec.MapData.startsWith('http') ? sec.MapData : `${baseUrl}/${sec.MapData}`;

      return fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => (data ? { id: sec.SectionId, data, status: (sec as any).Status || (sec as any).status } : null))
        .catch(() => null);
    });

    Promise.all(fetchPromises).then((results) => {
      const validResults = results.filter((item) => item !== null) as { id: number; data: any; status?: string }[];
      setGeoDataList(validResults);
    });
  }, [sections, baseUrl]);

  return (
    <>
      {geoDataList.map((item) => (
        <GeoJSON
          key={`multi-geojson-${item.id}`}
          data={item.data}
          style={() => ({
            color: getRouteColor(item.status),
            weight: 6,
            opacity: 0.85,
          })}
        />
      ))}
    </>
  );
}

interface ExpresswayItem {
  ExpresswayId: number;
  NameExpressway: string;
  Symbol: string;
  Description?: string;
  Tag?: string;
  MapData?: string;
}

interface SectionItem {
  SectionId: number;
  ExpresswayId: number;
  NameSection: string;
  MapData: string;
  SpeedSign?: string;
  SpeedLimit?: string;
  lat?: number;
  lng?: number;
  interchange?: InterchangeItem[];
  restStop?: RestStopItem[];
}

interface InterchangeItem {
  InterchangeId: number;
  SectionId: number;
  NameInterchange: string;
  Location: string;
  Latitude: number | null;
  Longitude: number | null;
  Type?: string;
  Connection?: string;
  Status?: string;
}

interface RestStopItem {
  RestStopId: number;
  SectionId: number;
  NameRestStop: string;
  Location: string;
  Latitude: number | null;
  Longitude: number | null;
  HasPetrol: boolean;
  HasFood: boolean;
  HasToilet: boolean;
  Status?: string;
}

export default function MapComponent() {
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [nearestDrawerOpen, setNearestDrawerOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(12);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [expressways, setExpressways] = useState<ExpresswayItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [allInterchanges, setAllInterchanges] = useState<InterchangeItem[]>([]);
  const [allRestStops, setAllRestStops] = useState<RestStopItem[]>([]);
  const [selectedExpressway, setSelectedExpressway] = useState<number>(100);
  const [selectedSection, setSelectedSection] = useState<number | 'ALL'>('ALL');
  const [selectedInterchange, setSelectedInterchange] = useState<number | null>(null);
  const [selectedRestStop, setSelectedRestStop] = useState<number | null>(null);

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
    const fetchData = async () => {
      try {
        const [expRes, secRes, icRes, rsRes] = await Promise.all([
          axiosClient.get('/expressways').catch(() => ({ data: [] })),
          axiosClient.get('/sections').catch(() => ({ data: [] })),
          axiosClient.get('/interchanges').catch(() => ({ data: [] })),
          axiosClient.get('/rest-stops').catch(() => ({ data: [] })),
        ]);

        const expData = Array.isArray(expRes.data) ? expRes.data : expRes.data?.data || [];
        const secData = Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || [];
        const icData = Array.isArray(icRes.data) ? icRes.data : icRes.data?.data || [];
        const rsData = Array.isArray(rsRes.data) ? rsRes.data : rsRes.data?.data || [];

        const validInterchanges = icData.filter((i: InterchangeItem) => i.Latitude != null && i.Longitude != null);
        const validRestStops = rsData.filter((r: RestStopItem) => r.Latitude != null && r.Longitude != null);

        const processedSections = secData.map((sec: SectionItem) => {
          const secInterchanges = validInterchanges.filter((i: InterchangeItem) => i.SectionId === sec.SectionId);
          const secRestStops = validRestStops.filter((r: RestStopItem) => r.SectionId === sec.SectionId);

          const allPoints = [
            ...secInterchanges.map((i: { Latitude: any; Longitude: any; }) => ({ lat: i.Latitude!, lng: i.Longitude! })),
            ...secRestStops.map((r: { Latitude: any; Longitude: any; }) => ({ lat: r.Latitude!, lng: r.Longitude! }))
          ];

          let midLat = sec.lat;
          let midLng = sec.lng;

          if (!midLat && !midLng && allPoints.length > 0) {
            const sumLat = allPoints.reduce((sum, p) => sum + p.lat, 0);
            const sumLng = allPoints.reduce((sum, p) => sum + p.lng, 0);
            midLat = sumLat / allPoints.length;
            midLng = sumLng / allPoints.length;
          }

          return {
            ...sec,
            lat: midLat || 20.832,
            lng: midLng || 105.882,
          };
        });

        setExpressways(expData);
        setSections(processedSections);
        setAllInterchanges(validInterchanges);
        setAllRestStops(validRestStops);

        if (expData.length > 0) {
          setSelectedExpressway(expData[0].ExpresswayId);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bản đồ:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setGeoJsonData(null);
    let mapPath = '';

    if (selectedSection === 'ALL') {
      const currentEx = expressways.find((e) => e.ExpresswayId === selectedExpressway);
      mapPath = currentEx?.MapData || '';
    } else {
      const sec = sections.find((s) => s.SectionId === selectedSection);
      if (sec) mapPath = sec.MapData;
    }

    if (!mapPath) return;

    const fullMapUrl = mapPath.startsWith('http') ? mapPath : `${baseUrl}/${mapPath}`;

    fetch(fullMapUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy file GeoJSON');
        return res.json();
      })
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Lỗi khi tải GeoJSON:', err));
  }, [selectedSection, selectedExpressway, expressways, sections]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => s.ExpresswayId === selectedExpressway);
  }, [sections, selectedExpressway]);

  const currentInterchanges = useMemo(() => {
    if (selectedSection === 'ALL') {
      const secIds = filteredSections.map((s) => s.SectionId);
      return allInterchanges.filter((i) => secIds.includes(i.SectionId));
    }
    return allInterchanges.filter((i) => i.SectionId === selectedSection);
  }, [allInterchanges, selectedSection, filteredSections]);

  const currentRestStops = useMemo(() => {
    if (selectedSection === 'ALL') {
      const secIds = filteredSections.map((s) => s.SectionId);
      return allRestStops.filter((r) => secIds.includes(r.SectionId));
    }
    return allRestStops.filter((r) => r.SectionId === selectedSection);
  }, [allRestStops, selectedSection, filteredSections]);

  const nearestInfo = useMemo(() => {
    if (!position) return null;

    const [uLat, uLng] = position;

    let nearestIC: { item: InterchangeItem; dist: number } | null = null;
    allInterchanges.forEach((ic) => {
      if (ic.Latitude && ic.Longitude) {
        const d = calculateDistance(uLat, uLng, ic.Latitude, ic.Longitude);
        if (!nearestIC || d < nearestIC.dist) {
          nearestIC = { item: ic, dist: d };
        }
      }
    });

    let nearestRS: { item: RestStopItem; dist: number } | null = null;
    allRestStops.forEach((rs) => {
      if (rs.Latitude && rs.Longitude) {
        const d = calculateDistance(uLat, uLng, rs.Latitude, rs.Longitude);
        if (!nearestRS || d < nearestRS.dist) {
          nearestRS = { item: rs, dist: d };
        }
      }
    });

    let nearestSec: { item: SectionItem; dist: number } | null = null;
    sections.forEach((sec) => {
      if (sec.lat && sec.lng) {
        const d = calculateDistance(uLat, uLng, sec.lat, sec.lng);
        if (!nearestSec || d < nearestSec.dist) {
          nearestSec = { item: sec, dist: d };
        }
      }
    });

    return { nearestIC, nearestRS, nearestSec };
  }, [position, allInterchanges, allRestStops, sections]);

  const handleSelectSection = (value: number | 'ALL') => {
    setSelectedSection(value);
    setSelectedInterchange(null);
    setSelectedRestStop(null);

    if (value !== 'ALL') {
      const sec = sections.find((s) => s.SectionId === value);
      if (sec && sec.lat && sec.lng) {
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
    if (ic && ic.Latitude && ic.Longitude) {
      setTargetCenter([ic.Latitude, ic.Longitude]);
      setTargetZoom(15);
    }
    if (!screens.md) setDrawerOpen(false);
  };

  const handleSelectRestStop = (id: number) => {
    setSelectedRestStop(id);
    setSelectedInterchange(null);
    const rs = allRestStops.find((r) => r.RestStopId === id);
    if (rs && rs.Latitude && rs.Longitude) {
      setTargetCenter([rs.Latitude, rs.Longitude]);
      setTargetZoom(15);
    }
    if (!screens.md) setDrawerOpen(false);
  };

  const renderNearestContent = () => {
    if (!nearestInfo) return null;
    return (
      <div>
        {nearestInfo.nearestSec && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>Nearest Route:</div>
            <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
              {(nearestInfo.nearestSec as any).item.NameSection}
            </Text>
            <div style={{ fontSize: 11, color: '#595959' }}>
              Distance about: <b>{(nearestInfo.nearestSec as any).dist.toFixed(1)} km</b>
            </div>
          </div>
        )}

        <Divider style={{ margin: '6px 0' }} />

        {nearestInfo.nearestIC && (
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Nearest Interchange:</div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                {(nearestInfo.nearestIC as any).item.NameInterchange}
              </div>
              <div style={{ fontSize: 11, color: '#ff4d4f' }}>
                Distance <b>{(nearestInfo.nearestIC as any).dist.toFixed(1)} km</b> (Km {(nearestInfo.nearestIC as any).item.Location})
              </div>
            </div>
            <Button
              type="primary"
              ghost
              shape="circle"
              size="small"
              icon={<PartitionOutlined />}
              onClick={() => {
                const icItem = (nearestInfo.nearestIC! as any).item;
                if (icItem.Latitude && icItem.Longitude) {
                  setTargetCenter([icItem.Latitude, icItem.Longitude]);
                  setTargetZoom(15);
                  if (!screens.md) setNearestDrawerOpen(false);
                }
              }}
            />
          </div>
        )}

        <Divider style={{ margin: '6px 0' }} />

        {nearestInfo.nearestRS && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Nearest Rest Stop:</div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>
                {(nearestInfo.nearestRS as any).item.NameRestStop}
              </div>
              <div style={{ fontSize: 11, color: '#52c41a' }}>
                Distance <b>{(nearestInfo.nearestRS as any).dist.toFixed(1)} km</b> (Km {(nearestInfo.nearestRS as any).item.Location})
              </div>
            </div>
            <Button
              type="primary"
              ghost
              shape="circle"
              size="small"
              icon={<PartitionOutlined />}
              onClick={() => {
                const rsItem = (nearestInfo.nearestRS! as any).item;
                if (rsItem.Latitude && rsItem.Longitude) {
                  setTargetCenter([rsItem.Latitude, rsItem.Longitude]);
                  setTargetZoom(15);
                  if (!screens.md) setNearestDrawerOpen(false);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

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
        placeholder="Choosing Expressway"
        value={selectedSection}
        onChange={handleSelectSection}
        options={[
          { label: 'All Expressway', value: 'ALL' },
          ...filteredSections.map((s) => ({ label: s.NameSection, value: s.SectionId })),
        ]}
      />

      <Select
        allowClear
        style={{ width: screens.md ? 180 : '100%' }}
        placeholder="Choosing Interchange"
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
        placeholder="Choosing Rest Stop"
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
            Filter
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

      {nearestInfo && (
        screens.md ? (
          <Card
            size="small"
            title={
              <Space>
                <CompassOutlined style={{ color: '#1890ff' }} />
                <Text style={{ fontSize: 13 }}>Nearest route</Text>
              </Space>
            }
            style={{
              position: 'absolute',
              bottom: 24,
              right: 12,
              zIndex: 1000,
              width: 300,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            {renderNearestContent()}
          </Card>
        ) : (
          <>
            <Button
              type="primary"
              shape="round"
              icon={<CompassOutlined />}
              onClick={() => setNearestDrawerOpen(true)}
              style={{
                position: 'absolute',
                bottom: 24,
                right: 12,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              Nearest route
            </Button>

            <Drawer
              title={
                <Space>
                  <CompassOutlined style={{ color: '#1890ff' }} />
                  <span>Nearest route</span>
                </Space>
              }
              placement="bottom"
              height="auto"
              onClose={() => setNearestDrawerOpen(false)}
              open={nearestDrawerOpen}
              styles={{ body: { padding: '12px 16px 24px' } }}
            >
              {renderNearestContent()}
            </Drawer>
          </>
        )
      )}

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
        {selectedSection === 'ALL' ? (
          <MultiSectionGeoJson sections={filteredSections} baseUrl={baseUrl} />
        ) : (
          <GeoJsonLayerWrapper data={geoJsonData} keyId={selectedSection} sections={sections} />
        )}

        {userLocationIcon && (
          <Marker position={position} icon={userLocationIcon}>
            <Popup>
              <b>Your location</b>
            </Popup>
          </Marker>
        )}

        {filteredSections.map((sec) => {
          if (!sec.lat || !sec.lng) return null;

          const signImageUrl = sec.SpeedSign
            ? sec.SpeedSign.startsWith('http')
              ? sec.SpeedSign
              : `${baseUrl}/${sec.SpeedSign}`
            : '';

          return (
            <Marker
              key={`speed-sign-${sec.SectionId}`}
              position={[sec.lat, sec.lng]}
              icon={signImageUrl ? createSpeedSignIcon(signImageUrl)! : interchangeIcon!}
              zIndexOffset={500}
            >
              <Popup>
                <div style={{ textAlign: 'center', minWidth: 180 }}>
                  <Tag color="red">Speed Sign</Tag>
                  <h4 style={{ margin: '8px 0 4px 0' }}>{sec.NameSection}</h4>
                  {signImageUrl && (
                    <Image
                      src={signImageUrl}
                      alt="Speed Sign"
                      width={140}
                      style={{ borderRadius: 6, border: '1px solid #eee', marginTop: 4 }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {currentInterchanges.map((ic) => (
          <Marker
            key={`ic-${ic.InterchangeId}`}
            position={[ic.Latitude!, ic.Longitude!]}
            icon={interchangeIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="blue" icon={<BranchesOutlined />}>
                  {t("map.interchange")}
                </Tag>
                <h4 style={{ margin: '6px 0 2px 0' }}>{ic.NameInterchange}</h4>
                <div><b>Vị trí:</b> Km {ic.Location}</div>
                {ic.Connection && <div><b>Connection:</b> {ic.Connection}</div>}
                {ic.Status && <div><b>Status:</b> {ic.Status}</div>}
              </div>
            </Popup>
          </Marker>
        ))}

        {currentRestStops.map((rs) => (
          <Marker
            key={`rs-${rs.RestStopId}`}
            position={[rs.Latitude!, rs.Longitude!]}
            icon={restStopIcon!}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <Tag color="green" icon={<CoffeeOutlined />}>
                  {t("map.restStop")}
                </Tag>
                <h4 style={{ margin: '6px 0 2px 0' }}>{rs.NameRestStop}</h4>
                <div><b>{t("map.location")}:</b> Km {rs.Location}</div>
                <Space wrap style={{ marginTop: 4 }}>
                  {rs.HasPetrol && <Tag color="orange">{t("map.petrol")}</Tag>}
                  {rs.HasFood && <Tag color="blue">{t("map.food")}</Tag>}
                  {rs.HasToilet && <Tag color="cyan">{t("map.toilet")}</Tag>}
                </Space>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
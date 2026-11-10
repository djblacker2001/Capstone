import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Switch, Modal, ScrollView, TextInput } from 'react-native';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../components/AuthContext';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Speech from 'expo-speech';
import axiosClient from '../api/axiosClient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { ExpresswayItem, InterchangeItem, RestStopItem, SectionItem, TunnelItem } from './Data';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
const LOCATION_TASK_NAME = 'BACKGROUND_NAVIGATION_TASK';
let globalSpeedLimit = 80;

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

// 1. Khai báo các biến global dùng chung giữa React Component và Background Task
export let globalMaxSpeed = 0;
export let globalMinSpeed = 0;
export let globalIsTunnel = false;
export let globalTunnelName = '';
export let globalDistToTunnelKm: number | undefined = undefined;
export let globalSelectedInterchangeName = '';
export let globalDistToInterchangeKm: number | null = null;

let lastMaxSpeedWarningTime = 0;
let lastMinSpeedWarningTime = 0;
let hasWarnedTunnelBackground = false;
let hasWarnedInterchange1km = false;
let hasWarnedInterchange500m = false;
let hasPassedRestStop = false;
let hasWarnedRestStop1km = false;
let hasWarnedRestStop500m = false;

// 2. Định nghĩa Background Task với đủ 3 loại cảnh báo
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error || !data) return;
    const { locations } = data;
    const currentLocation = locations[0];

    if (currentLocation) {
        const { speed } = currentLocation.coords;
        // Chuyển m/s sang km/h
        const speedKmH = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
        const now = Date.now();

        // 🔴 1. CẢNH BÁO QUÁ TỐC ĐỘ TỐI ĐA
        if (globalMaxSpeed > 0 && speedKmH > globalMaxSpeed) {
            if (now - lastMaxSpeedWarningTime > 8000) {
                lastMaxSpeedWarningTime = now;
                Speech.stop();
                Speech.speak(
                    `Vui lòng giảm tốc độ!`,
                    { language: 'vi-VN', pitch: 1.0, rate: 0.9 }
                );
            }
            return;
        }

        // 🔵 2. CẢNH BÁO DƯỚI TỐC ĐỘ TỐI THIỂU (Chỉ báo khi đang chạy > 20 km/h)
        if (globalMinSpeed > 0 && speedKmH > 20 && speedKmH < globalMinSpeed) {
            if (now - lastMinSpeedWarningTime > 10000) {
                lastMinSpeedWarningTime = now;
                Speech.stop();
                Speech.speak(
                    `Vui lòng tăng tốc độ!`,
                    { language: 'vi-VN', pitch: 1.0, rate: 0.9 }
                );
            }
            return;
        }

        // 🟡 3. CẢNH BÁO SẮP VÀO ĐƯỜNG HẦM (Trước khi vào hầm khoảng 300m - 400m)
        if (
            globalDistToTunnelKm !== undefined &&
            globalDistToTunnelKm <= 0.4 &&
            globalDistToTunnelKm > 0 &&
            !hasWarnedTunnelBackground
        ) {
            hasWarnedTunnelBackground = true;
            Speech.stop();
            Speech.speak(
                `Sắp vào đường hầm, vui lòng bật đèn chiếu gần!`,
                { language: 'vi-VN', pitch: 1.0, rate: 0.9 }
            );
        }

        // Reset lại cờ báo hầm khi đã ra khỏi hầm và đi xa > 1km
        if (!globalIsTunnel && globalDistToTunnelKm && globalDistToTunnelKm > 1.0) {
            hasWarnedTunnelBackground = false;
        }
    }
});

export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const { isLoggedIn, loading } = useAuth();
    const navigation = useNavigation<any>();
    const webViewRef = useRef<any>(null);

    const [position, setPosition] = useState<[number, number] | null>(null);
    const [currentSpeed, setCurrentSpeed] = useState<number>(0);
    const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
    const [loadingMap, setLoadingMap] = useState<boolean>(true);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const [expressways, setExpressways] = useState<ExpresswayItem[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [tunnels, setTunnels] = useState<TunnelItem[]>([]);
    const [allInterchanges, setAllInterchanges] = useState<InterchangeItem[]>([]);
    const [interchanges, setInterchanges] = useState<InterchangeItem[]>([]);
    const [allRestStops, setAllRestStops] = useState<RestStopItem[]>([]);

    const [selectedExpressway, setSelectedExpressway] = useState<number | null>(null);
    const [selectedSection, setSelectedSection] = useState<number | 'ALL'>('ALL');
    const [selectedInterchange, setSelectedInterchange] = useState<InterchangeItem | null>(null);
    const [selectedRestStop, setSelectedRestStop] = useState<RestStopItem | null>(null);

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [nearestDrawerOpen, setNearestDrawerOpen] = useState<boolean>(false);

    const [searchInterchange, setSearchInterchange] = useState<string>('');
    const [searchRestStop, setSearchRestStop] = useState<string>('');

    const testVoiceAlerts = async () => {
        const voices = await Speech.getAvailableVoicesAsync();
        const viVoices = voices.filter((v) => v.language.includes('vi'));
        console.log('--- DANH SÁCH GIỌNG TIẾNG VIỆT KHẢ DỤNG ---', viVoices);
        Speech.stop();
        Speech.speak('Vui lòng giảm tốc độ!', {
            language: 'vi-VN',
            rate: 0.9,
            pitch: 1.0,
        });

        setTimeout(() => {
            Speech.stop();
            Speech.speak('Vui lòng tăng tốc độ!', {
                language: 'vi-VN',
                rate: 0.9,
            });
        }, 5000);

        setTimeout(() => {
            Speech.stop();
            Speech.speak('Sắp vào đường hầm, vui lòng bật đèn chiếu gần!', {
                language: 'vi-VN',
                rate: 0.9,
            });
        }, 10000);

        setTimeout(() => {
            Speech.stop();
            Speech.speak('Chú ý! Còn 1 kilômét nữa đến nút giao Thiệu Giang. Vui lòng chuẩn bị chuyển làn!`', {
                language: 'vi-VN',
                rate: 0.9,
            });
        }, 15000);
    };

    const handleOpenDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

    useFocusEffect(
        useCallback(() => {
            if (!loading && !isLoggedIn) navigation.navigate('Login');
        }, [isLoggedIn, loading, navigation])
    );

    useEffect(() => {
        let isMounted = true;
        const fetchDataAndLocation = async () => {
            try {
                if (isMounted) setLoadingMap(true);

                const [expRes, secRes, icRes, rsRes] = await Promise.all([
                    axiosClient.get('/expressways').catch(() => ({ data: [] })),
                    axiosClient.get('/sections').catch(() => ({ data: [] })),
                    axiosClient.get('/interchanges').catch(() => ({ data: [] })),
                    axiosClient.get('/rest-stops').catch(() => ({ data: [] })),
                ]);

                const expData: ExpresswayItem[] = Array.isArray(expRes.data) ? expRes.data : expRes.data?.data || [];
                const secData: SectionItem[] = Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || [];
                const icData: InterchangeItem[] = Array.isArray(icRes.data) ? icRes.data : icRes.data?.data || [];
                const rsData: RestStopItem[] = Array.isArray(rsRes.data) ? rsRes.data : rsRes.data?.data || [];

                const validIC = icData.filter((i) => i.Latitude != null && i.Longitude != null);
                const validRS = rsData.filter((r) => r.Latitude != null && r.Longitude != null);

                const processedSections = secData.map((sec) => {
                    const secIC = validIC.filter((i) => i.SectionId === sec.SectionId);
                    const secRS = validRS.filter((r) => r.SectionId === sec.SectionId);
                    const allPoints = [
                        ...secIC.map((i) => ({ lat: i.Latitude!, lng: i.Longitude! })),
                        ...secRS.map((r) => ({ lat: r.Latitude!, lng: r.Longitude! })),
                    ];
                    let midLat = sec.lat || (allPoints.length > 0 ? allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length : 20.832);
                    let midLng = sec.lng || (allPoints.length > 0 ? allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length : 105.882);

                    return { ...sec, lat: midLat, lng: midLng };
                });

                if (isMounted) {
                    setExpressways(expData);
                    setSections(processedSections);
                    setAllInterchanges(validIC);
                    setAllRestStops(validRS);
                    if (expData.length > 0) setSelectedExpressway(expData[0].ExpresswayId);
                }

                const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
                if (status === 'granted') {
                    await Location.watchPositionAsync(
                        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 2 },
                        (loc) => {
                            if (!isMounted) return;
                            const { latitude, longitude, speed } = loc.coords;
                            setPosition([latitude, longitude]);
                            const speedKmH = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
                            setCurrentSpeed(speedKmH);

                            webViewRef.current?.injectJavaScript(`
                                (function() {
                                    try {
                                        if (window.updateUserLocation) {
                                            window.updateUserLocation(${latitude}, ${longitude});
                                        }
                                    } catch(e) {}
                                })();
                                true;
                            `);
                        }
                    );
                }
            } catch (err) {
                console.warn('Lỗi tải dữ liệu bản đồ:', err);
            } finally {
                if (isMounted) setLoadingMap(false);
            }
        };

        fetchDataAndLocation();
        return () => { isMounted = false; };
    }, []);

    const nearestInfo = useMemo<{
        nearestIC: { item: InterchangeItem; dist: number } | null;
        nearestRS: { item: RestStopItem; dist: number } | null;
        nearestSec: { item: SectionItem; dist: number } | null;
    } | null>(() => {
        if (!position) return null;
        const [uLat, uLng] = position;

        let nearestIC: { item: InterchangeItem; dist: number } | null = null;
        allInterchanges.forEach((ic) => {
            if (ic.Latitude && ic.Longitude) {
                const d = calculateDistance(uLat, uLng, ic.Latitude, ic.Longitude);
                if (!nearestIC || d < nearestIC.dist) nearestIC = { item: ic, dist: d };
            }
        });

        let nearestRS: { item: RestStopItem; dist: number } | null = null;
        allRestStops.forEach((rs) => {
            if (rs.Latitude && rs.Longitude) {
                const d = calculateDistance(uLat, uLng, rs.Latitude, rs.Longitude);
                if (!nearestRS || d < nearestRS.dist) nearestRS = { item: rs, dist: d };
            }
        });

        let nearestSec: { item: SectionItem; dist: number } | null = null;
        sections.forEach((sec) => {
            if (sec.lat && sec.lng) {
                const d = calculateDistance(uLat, uLng, sec.lat, sec.lng);
                if (!nearestSec || d < nearestSec.dist) nearestSec = { item: sec, dist: d };
            }
        });

        return { nearestIC, nearestRS, nearestSec };
    }, [position, allInterchanges, allRestStops, sections]);

    const filteredSections = useMemo(
        () => sections.filter((s) => s.ExpresswayId === selectedExpressway),
        [sections, selectedExpressway]
    );

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

    // 🟢 Lọc danh sách Nút giao theo từ khóa tìm kiếm (dùng useMemo để tối ưu hiệu năng)
    const filteredInterchanges = useMemo(() => {
        if (!searchInterchange.trim()) return currentInterchanges;
        return currentInterchanges.filter((i) =>
            i.NameInterchange.toLowerCase().includes(searchInterchange.toLowerCase()) ||
            (i.Location && i.Location.toLowerCase().includes(searchInterchange.toLowerCase()))
        );
    }, [currentInterchanges, searchInterchange]);

    // 🟢 Lọc danh sách Trạm dừng chân theo từ khóa tìm kiếm
    const filteredRestStops = useMemo(() => {
        if (!searchRestStop.trim()) return allRestStops;
        return allRestStops.filter((r) =>
            (r.NameRestStop || '').toLowerCase().includes(searchRestStop.toLowerCase())
        );
    }, [allRestStops, searchRestStop]);

    // TÍNH TOÁN TỐC ĐỘ TỐI ĐA & TỐI THIỂU (BAO GỒM CẢ HẦM)
    const currentSpeedLimits = useMemo(() => {
        let targetMax = 0;
        let targetMin = 0;
        let activeTunnel = null;
        let minDistanceKm = Infinity;

        if (userLocation?.latitude && userLocation?.longitude && tunnels && tunnels.length > 0) {
            activeTunnel = tunnels.find((tunnel: any) => {
                if (!tunnel.Latitude || !tunnel.Longitude) return false;
                const distKm = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    Number(tunnel.Latitude),
                    Number(tunnel.Longitude)
                );

                const tunnelLengthKm = Number(tunnel.Length) || 0.5;
                const safeRadiusKm = (tunnelLengthKm / 2) + 0.08;

                return distKm <= safeRadiusKm;
            });
        }

        if (activeTunnel) {
            targetMax = activeTunnel.MaxSpeed ? Number(activeTunnel.MaxSpeed) : 80;
            targetMin = activeTunnel.MinSpeed ? Number(activeTunnel.MinSpeed) : 50;
            return {
                max: targetMax,
                min: targetMin,
                isTunnel: true,
                tunnelName: activeTunnel.NameTunnel || 'Đường hầm',
            };
        }

        let targetSec: SectionItem | null = null;

        if (selectedSection !== 'ALL') {
            targetSec = sections.find((s) => s.SectionId === selectedSection) || null;
        } else if (nearestInfo?.nearestSec?.item) {
            targetSec = nearestInfo.nearestSec.item;
        } else if (sections && sections.length > 0) {
            targetSec = sections[0];
        }

        targetMax = targetSec?.MaxSpeed ? Number(targetSec.MaxSpeed) : 0;
        targetMin = targetSec?.MinSpeed ? Number(targetSec.MinSpeed) : 0;

        return {
            max: targetMax,
            min: targetMin,
            isTunnel: false,
            tunnelName: '',
            distToTunnelKm: minDistanceKm !== Infinity ? minDistanceKm : undefined,
        };
    }, [selectedSection, sections, nearestInfo, userLocation, tunnels]);

    const distToSelectedInterchangeKm = useMemo(() => {
        console.log("👉 USER LOC:", userLocation);
        if (!selectedInterchange || !userLocation?.latitude || !userLocation?.longitude) {
            return null;
        }

        const targetLat = Number(selectedInterchange.Latitude);
        const targetLng = Number(selectedInterchange.Longitude);
        const userLat = Number(userLocation.latitude);
        const userLng = Number(userLocation.longitude);
        console.log("👉 TARGET INTERCHANGE:", selectedInterchange);
        if (
            selectedInterchange.Latitude == null ||
            selectedInterchange.Longitude == null ||
            isNaN(targetLat) ||
            isNaN(targetLng) ||
            isNaN(userLat) ||
            isNaN(userLng)
        ) {
            return null;
        }

        return calculateDistance(userLat, userLng, targetLat, targetLng);
    }, [selectedInterchange, userLocation]);

    const distToSelectedRestStopKm = useMemo(() => {
        if (!selectedRestStop || !userLocation?.latitude || !userLocation?.longitude) {
            return null;
        }

        const targetLat = Number(selectedRestStop.Latitude);
        const targetLng = Number(selectedRestStop.Longitude);
        const userLat = Number(userLocation.latitude);
        const userLng = Number(userLocation.longitude);

        if (
            selectedRestStop.Latitude == null ||
            selectedRestStop.Longitude == null ||
            isNaN(targetLat) ||
            isNaN(targetLng) ||
            isNaN(userLat) ||
            isNaN(userLng)
        ) {
            return null;
        }

        return calculateDistance(userLat, userLng, targetLat, targetLng);
    }, [selectedRestStop, userLocation]);

    useEffect(() => {
        globalMaxSpeed = currentSpeedLimits.max;
        globalMinSpeed = currentSpeedLimits.min;
        globalIsTunnel = currentSpeedLimits.isTunnel;
        globalTunnelName = currentSpeedLimits.tunnelName;
        globalDistToTunnelKm = currentSpeedLimits.distToTunnelKm;
    }, [currentSpeedLimits]);

    useEffect(() => {
        if (selectedSection !== 'ALL') {
            const currentSec = sections.find((s) => s.SectionId === selectedSection);
            if (currentSec?.SpeedLimit) {
                const parsedLimit = parseInt(currentSec.SpeedLimit, 10);
                if (!isNaN(parsedLimit) && parsedLimit > 0) {
                    globalSpeedLimit = parsedLimit;
                }
            }
        }
    }, [selectedSection, sections]);



    const flyToLocation = (lat: number, lng: number, zoom = 14) => {
        webViewRef.current?.injectJavaScript(`
            if (window.map) {
                window.map.flyTo([${lat}, ${lng}], ${zoom}, { duration: 1.5 });
            }
            true;
        `);
    };

    useEffect(() => {
        if (!selectedInterchange || distToSelectedInterchangeKm === null) return;

        const interchangeName = selectedInterchange.NameInterchange || 'Nút giao';

        // 🔴 1. Cảnh báo khi còn cách 1 km (từ 0.8 km đến 1.1 km)
        if (distToSelectedInterchangeKm <= 1.1 && distToSelectedInterchangeKm > 0.8 && !hasWarnedInterchange1km) {
            hasWarnedInterchange1km = true;
            Speech.stop();
            Speech.speak(`Chú ý! Còn 1 kilômét nữa đến nút giao ${interchangeName}. Vui lòng chuẩn bị chuyển làn!`, {
                language: 'vi-VN',
                rate: 0.9,
            });
        }

        // 🔴 2. Cảnh báo gấp khi còn cách 500m (từ 0.3 km đến 0.6 km)
        if (distToSelectedInterchangeKm <= 0.6 && distToSelectedInterchangeKm > 0.3 && !hasWarnedInterchange500m) {
            hasWarnedInterchange500m = true;
            Speech.stop();
            Speech.speak(`Sắp tới nút giao ${interchangeName}! Vui lòng giảm tốc độ và rẽ vào lối ra!`, {
                language: 'vi-VN',
                rate: 0.9,
            });
        }

        // Reset cờ khi đi qua hoặc hủy chọn nút giao
        if (distToSelectedInterchangeKm > 2.0) {
            hasWarnedInterchange1km = false;
            hasWarnedInterchange500m = false;
        }
    }, [distToSelectedInterchangeKm, selectedInterchange]);

    useEffect(() => {
        globalSelectedInterchangeName = selectedInterchange?.NameInterchange || '';
        globalDistToInterchangeKm = distToSelectedInterchangeKm;
    }, [selectedInterchange, distToSelectedInterchangeKm]);

    useEffect(() => {
        if (!selectedRestStop || distToSelectedRestStopKm === null) return;

        // 1. Cảnh báo 1km
        if (distToSelectedRestStopKm <= 1.1 && distToSelectedRestStopKm > 0.8 && !hasWarnedRestStop1km) {
            hasWarnedRestStop1km = true;
            Speech.stop();
            Speech.speak(`Chú ý! Còn 1 kilômét nữa đến ${selectedRestStop.NameRestStop || 'Trạm dừng chân'}. Vui lòng chuẩn bị giảm tốc độ!`, {
                language: 'vi-VN',
                rate: 0.9,
            });
        }

        // 2. Cảnh báo 500m
        if (distToSelectedRestStopKm <= 0.6 && distToSelectedRestStopKm > 0.3 && !hasWarnedRestStop500m) {
            hasWarnedRestStop500m = true;
            Speech.stop();
            Speech.speak(`Sắp tới ${selectedRestStop.NameRestStop || 'Trạm dừng chân'}! Vui lòng rẽ vào làn dừng nghỉ!`, {
                language: 'vi-VN',
                rate: 0.9,
            });
        }

        // 3. Tự động reset khi xe đã đi qua trạm dừng
        if (distToSelectedRestStopKm < 0.15) {
            hasPassedRestStop = true;
        }

        if (hasPassedRestStop && distToSelectedRestStopKm > 0.3) {
            Speech.stop();
            Speech.speak(`Bạn đã đi qua ${selectedRestStop.NameRestStop || 'Trạm dừng chân'}.`, { language: 'vi-VN' });

            // Auto reset state
            setSelectedRestStop(null);
            hasPassedRestStop = false;
            hasWarnedRestStop1km = false;
            hasWarnedRestStop500m = false;
        }
    }, [distToSelectedRestStopKm, selectedRestStop]);

    useEffect(() => {
        if (!webViewRef.current || expressways.length === 0) return;

        let isMounted = true;

        const loadGeoJsonAndInject = async () => {
            try {
                let singleGeoData: any = null;
                let multiGeoDataList: { id: number; data: any; status?: string }[] = [];
                let currentStatus = '';

                const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

                if (selectedSection === 'ALL') {
                    const fetchPromises = filteredSections.map(async (sec) => {
                        if (!sec.MapData) return null;
                        const fullUrl = sec.MapData.startsWith('http')
                            ? sec.MapData
                            : `${cleanBaseUrl}/${sec.MapData.replace(/^\/+/, '')}`;

                        try {
                            const res = await fetch(fullUrl);
                            if (res.ok) {
                                const data = await res.json();
                                return { id: sec.SectionId, data, status: sec.Status };
                            }
                        } catch (e) {
                            console.warn(`Không tải được GeoJSON Section ${sec.SectionId}:`, e);
                        }
                        return null;
                    });

                    const results = await Promise.all(fetchPromises);
                    multiGeoDataList = results.filter((item) => item !== null) as any[];
                } else {
                    const sec = sections.find((s) => s.SectionId === selectedSection);
                    if (sec && sec.MapData) {
                        currentStatus = sec.Status || '';
                        const fullUrl = sec.MapData.startsWith('http')
                            ? sec.MapData
                            : `${cleanBaseUrl}/${sec.MapData.replace(/^\/+/, '')}`;

                        try {
                            const res = await fetch(fullUrl);
                            if (res.ok) {
                                singleGeoData = await res.json();
                            }
                        } catch (e) {
                            console.warn(`Lỗi tải GeoJSON Section ${selectedSection}:`, e);
                        }
                    }
                }

                if (!isMounted) return;

                const payloadObj = {
                    sections: filteredSections,
                    interchanges: currentInterchanges,
                    restStops: currentRestStops,
                    geoJsonData: singleGeoData,
                    geoJsonDataList: multiGeoDataList,
                    status: currentStatus,
                    baseUrl: cleanBaseUrl,
                };

                const payloadString = JSON.stringify(payloadObj);
                webViewRef.current?.injectJavaScript(`
                    (function() {
                        try {
                            var parsedData = ${payloadString};
                            if (window.updateMapFeatures) {
                                window.updateMapFeatures(parsedData);
                            }
                        } catch(e) {
                            console.error("Lỗi parse map data:", e);
                        }
                    })();
                    true;
                `);
            } catch (err) {
                console.warn('Lỗi xử lý GeoJSON:', err);
            }
        };

        loadGeoJsonAndInject();

        return () => {
            isMounted = false;
        };
    }, [selectedExpressway, selectedSection, filteredSections, currentInterchanges, currentRestStops, expressways, sections]);

    // Ví dụ cấu trúc chuẩn khi lắng nghe GPS từ expo-location:
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription;

        const startLocationTracking = async () => {
            // 1. Xin quyền vị trí
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Chưa cấp quyền truy cập vị trí!');
                return;
            }

            // 2. Lắng nghe thay đổi vị trí real-time
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 5,
                },
                (location) => {
                    // 🟢 CẬP NHẬT TỌA ĐỘ VÀO STATE userLocation
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        };

        startLocationTracking();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, []);

    const toggleGpsBackground = async (value: boolean) => {
        if (value) {
            try {
                const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
                if (bgStatus !== 'granted') {
                    alert('Cần quyền vị trí "Luôn cho phép" để ứng dụng chạy ngầm!');
                    return;
                }
                const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
                if (!isRegistered) {
                    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 2000,
                        distanceInterval: 5,
                        showsBackgroundLocationIndicator: true,
                    });
                }
                setIsGpsActive(true);
            } catch (err) {
                console.warn('Lỗi khởi tạo GPS ngầm:', err);
            }
        } else {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (isRegistered) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            setIsGpsActive(false);
        }
    };



    const leafletHtml = useMemo(() => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #e5e3df; }
                .user-marker { width: 18px; height: 18px; background: #008744; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px rgba(0,168,89,0.8); }
                .icon-box { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px; color: white; }
                .ic-box { background: #1890ff; }
                .rs-box { background: #52c41a; }
                .facility-tag { display: inline-block; padding: 2px 6px; font-size: 10px; border-radius: 4px; margin-right: 4px; margin-top: 4px; color: white; }
                .bg-petrol { background-color: #ff9c6e; }
                .bg-food { background-color: #69c0ff; }
                .bg-toilet { background-color: #5cdbd3; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
            try {
                if (window.navigator && window.navigator.geolocation) {
                    window.navigator.geolocation.getCurrentPosition = function() {};
                    window.navigator.geolocation.watchPosition = function() {};
                }

                var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([16.047, 108.206], 6);
                window.map = map;

                L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19, subdomains: ['a', 'b', 'c'] }).addTo(map);

                var userMarker = null;
                var featureLayerGroup = L.layerGroup().addTo(map);

                window.updateUserLocation = function(lat, lng) {
                    try {
                        if (!userMarker) {
                            var customIcon = L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] });
                            userMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                            map.setView([lat, lng], 13);
                        } else {
                            userMarker.setLatLng([lat, lng]);
                        }
                    } catch(e) { console.error(e); }
                };

                function getRouteColor(statusStr) {
                    var s = (statusStr || '').toLowerCase().trim();
                    if (s === 'complete' || s === 'completed') return '#237804';
                    if (s === 'under construction' || s === 'construction') return '#1890ff';
                    if (s === 'extend under construction' || s === 'extend') return '#86c5ff';
                    if (s === 'not yet construction' || s === 'not_started' || s === 'planning') return '#faad14';
                    if (s === 'incident') return '#ff4d4f';
                    if (s === 'maintenance') return '#722ed1';
                    return '#1890ff';
                }

                window.updateMapFeatures = function(data) {
                    try {
                        featureLayerGroup.clearLayers();
                        if (!data) return;

                        // 🟢 0A. Vẽ 1 tuyến GeoJSON (Khi chọn 1 Phân đoạn cụ thể)
                        if (data.geoJsonData) {
                            var geoLayer = L.geoJSON(data.geoJsonData, {
                                style: function(feature) {
                                    var routeStatus = data.status || (feature && feature.properties ? (feature.properties.status || feature.properties.Status) : '');
                                    return {
                                        color: getRouteColor(routeStatus),
                                        weight: 6,
                                        opacity: 0.85
                                    };
                                }
                            }).addTo(featureLayerGroup);

                            try {
                                var bounds = geoLayer.getBounds();
                                if (bounds.isValid()) {
                                    map.fitBounds(bounds, { padding: [30, 30] });
                                }
                            } catch(e) {}
                        }

                        // 🟢 0B. Vẽ nhiều tuyến GeoJSON (Khi chọn "Tất cả phân đoạn" - ALL)
                        if (data.geoJsonDataList && Array.isArray(data.geoJsonDataList)) {
                            var multiBounds = L.latLngBounds([]);
                            data.geoJsonDataList.forEach(function(item) {
                                if (item && item.data) {
                                    var layer = L.geoJSON(item.data, {
                                        style: function(feature) {
                                            var routeStatus = item.status || (feature && feature.properties ? (feature.properties.status || feature.properties.Status) : '');
                                            return {
                                                color: getRouteColor(routeStatus),
                                                weight: 6,
                                                opacity: 0.85
                                            };
                                        }
                                    }).addTo(featureLayerGroup);

                                    try {
                                        var b = layer.getBounds();
                                        if (b.isValid()) multiBounds.extend(b);
                                    } catch(e) {}
                                }
                            });

                            try {
                                if (multiBounds.isValid()) {
                                    map.fitBounds(multiBounds, { padding: [30, 30] });
                                }
                            } catch(e) {}
                        }

                        // 🟢 1. Render Nút Giao
                        (data.interchanges || []).forEach(function(ic) {
                            if (ic && ic.Latitude && ic.Longitude) {
                                var icon = L.divIcon({ html: '<div class="icon-box ic-box">🔀</div>', iconSize: [28, 28], iconAnchor: [14, 14] });
                                var popupHtml = '<div style="min-width:140px;"><b>🔀 Nút Giao:</b> ' + (ic.NameInterchange || '') + 
                                    '<br/><b>Vị trí:</b> Km ' + (ic.Location || '') +
                                    (ic.Connection ? '<br/><b>Kết nối:</b> ' + ic.Connection : '') + '</div>';
                                L.marker([ic.Latitude, ic.Longitude], { icon: icon }).bindPopup(popupHtml).addTo(featureLayerGroup);
                            }
                        });

                        // 🟢 2. Render Trạm Dừng Chân
                        (data.restStops || []).forEach(function(rs) {
                            if (rs && rs.Latitude && rs.Longitude) {
                                var icon = L.divIcon({ html: '<div class="icon-box rs-box">☕</div>', iconSize: [28, 28], iconAnchor: [14, 14] });
                                var tagsHtml = '';
                                if (rs.HasPetrol) tagsHtml += '<span class="facility-tag bg-petrol">⛽ Cây xăng</span>';
                                if (rs.HasFood) tagsHtml += '<span class="facility-tag bg-food">🍲 Đồ ăn</span>';
                                if (rs.HasToilet) tagsHtml += '<span class="facility-tag bg-toilet">🚾 WC</span>';

                                var popupHtml = '<div style="min-width:150px;"><b>☕ Trạm Dừng:</b> ' + (rs.NameRestStop || '') + 
                                    '<br/><b>Vị trí:</b> Km ' + (rs.Location || '') + 
                                    '<div style="margin-top:4px;">' + tagsHtml + '</div></div>';
                                L.marker([rs.Latitude, rs.Longitude], { icon: icon }).bindPopup(popupHtml).addTo(featureLayerGroup);
                            }
                        });

                        // 🟢 3. Render Biển Báo Tốc Độ
                        (data.sections || []).forEach(function(sec) {
                            if (sec && sec.lat && sec.lng) {
                                var imgUrl = '';
                                if (sec.SpeedSign) {
                                    if (sec.SpeedSign.indexOf('http') === 0) {
                                        imgUrl = sec.SpeedSign;
                                    } else {
                                        var bUrl = data.baseUrl || '';
                                        var sPath = sec.SpeedSign;
                                        if (bUrl.charAt(bUrl.length - 1) === '/') bUrl = bUrl.slice(0, -1);
                                        if (sPath.charAt(0) === '/') sPath = sPath.slice(1);
                                        imgUrl = bUrl + '/' + sPath;
                                    }
                                }

                                var iconHtml = '';
                                if (imgUrl) {
                                    iconHtml = '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;border:2px solid #ff4d4f;box-shadow:0 2px 6px rgba(0,0,0,0.3);background:white;">' +
                                            '<img src="' + imgUrl + '" style="width:100%;height:100%;object-fit:cover;" />' +
                                            '</div>';
                                } else {
                                    iconHtml = '<div style="width:32px;height:32px;border-radius:50%;background:#ff4d4f;color:white;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-weight:bold;font-size:12px;">🛑</div>';
                                }

                                var customIcon = L.divIcon({ html: iconHtml, iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] });

                                var popupHtml = '<div style="text-align:center;min-width:180px;max-width:240px;padding:4px;">' +
                                    '<span style="background:#ff4d4f;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;">Biển Báo Tốc Độ</span>' +
                                    '<h4 style="margin:6px 0 4px 0;font-size:13px;color:#1E293B;">' + (sec.NameSection || 'Phân đoạn') + '</h4>';

                                if (imgUrl) {
                                    popupHtml += '<div style="margin:6px 0;border-radius:6px;overflow:hidden;border:1px solid #E2E8F0;background:#F8FAFC;">' +
                                                '<img src="' + imgUrl + '" style="width:100%;max-height:120px;object-fit:contain;display:block;" />' +
                                                '</div>';
                                }

                                if (sec.SpeedLimit) {
                                    popupHtml += '<div style="font-size:11px;color:#475569;background:#F1F5F9;padding:6px;border-radius:6px;text-align:left;">' +
                                                '<b>Giới hạn:</b> ' + sec.SpeedLimit +
                                                '</div>';
                                }
                                popupHtml += '</div>';

                                L.marker([sec.lat, sec.lng], { icon: customIcon, zIndexOffset: 500 })
                                .bindPopup(popupHtml)
                                .addTo(featureLayerGroup);
                            }
                        });
                    } catch(err) {
                        console.error("Lỗi updateMapFeatures:", err);
                    }
                };
            } catch(globalErr) {
                console.error("Lỗi khởi tạo Leaflet:", globalErr);
            }
            </script>
        </body>
        </html>
        `;
    }, []);

    if (loading || !isLoggedIn) return null;

    return (
        <View style={styles.container}>
            <Header onOpenDrawer={handleOpenDrawer} />

            <View style={styles.mapContainer}>
                {loadingMap && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#008744" />
                    </View>
                )}

                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    geolocationEnabled={false}
                    onLoadEnd={() => {
                        if (expressways.length > 0) {
                            setLoadingMap(false);
                        }
                    }}
                />

                <View style={styles.topSpeedLimitGroup}>
                    {/* Biển Tốc độ tối đa (Khoanh đỏ) */}
                    <View style={[styles.maxSpeedCircle, currentSpeedLimits.isTunnel && styles.tunnelBorder]}>
                        <Text style={styles.speedLimitValue}>{currentSpeedLimits.max}</Text>
                        <Text style={styles.speedLimitLabel}>
                            {currentSpeedLimits.isTunnel ? 'HẦM MAX' : 'MAX'}
                        </Text>
                    </View>

                    {/* Biển Tốc độ tối thiểu (Khoanh xanh) */}
                    <View style={[styles.minSpeedCircle, currentSpeedLimits.isTunnel && styles.tunnelBorderBlue]}>
                        <Text style={styles.speedLimitValueBlue}>{currentSpeedLimits.min}</Text>
                        <Text style={styles.speedLimitLabelBlue}>
                            {currentSpeedLimits.isTunnel ? 'HẦM MIN' : 'MIN'}
                        </Text>
                    </View>
                </View>

                <View style={styles.topActionGroup}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setSidebarOpen(true)}>
                        <Ionicons name="filter" size={18} color="#008744" />
                        <Text style={styles.actionBtnText}>Bộ lọc</Text>
                    </TouchableOpacity>

                    {nearestInfo && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setNearestDrawerOpen(true)}>
                            <Ionicons name="compass" size={18} color="#1890ff" />
                            <Text style={styles.actionBtnText}>Gần nhất</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.floatingSpeedBadge}>
                    <Text style={styles.speedValueText}>{currentSpeed}</Text>
                    <Text style={styles.speedUnitText}>km/h</Text>
                </View>
                {/* Container nổi ở góc dưới bên phải */}
                <View style={styles.filterFloatingBtn}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsFilterOpen(true)}
                    >
                        <Ionicons name="options-outline" size={24} color="#FFFFFF" />
                        {(selectedInterchange || selectedRestStop) && (
                            <View style={styles.activeFilterDot} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={sidebarOpen} animationType="fade" transparent={true} onRequestClose={() => setSidebarOpen(false)}>
                <TouchableOpacity
                    onPress={testVoiceAlerts}
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        right: 20,
                        backgroundColor: '#2563EB',
                        padding: 12,
                        borderRadius: 8,
                        zIndex: 999,
                    }}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>🔊 Test Giọng Nói</Text>
                </TouchableOpacity>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
                    <View style={[styles.sidebarContent, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
                        <View style={styles.sidebarHeader}>
                            <Text style={styles.sidebarTitle}>Bộ Lọc Hạ Tầng Cao Tốc</Text>
                            <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.sidebarSection}>
                                <Text style={styles.sectionLabel}>CẢNH BÁO LÁI XE</Text>
                                <View style={styles.sidebarItemRow}>
                                    <View style={styles.itemIconBox}>
                                        <Ionicons name={isGpsActive ? 'volume-high' : 'volume-mute'} size={20} color={isGpsActive ? '#008744' : '#64748B'} />
                                    </View>
                                    <View style={styles.itemTextBox}>
                                        <Text style={styles.itemTitle}>GPS & Giọng nói ngầm</Text>
                                        <Text style={styles.itemSub}>Phát âm thanh khi quá tốc độ lúc tắt màn hình</Text>
                                    </View>
                                    <Switch value={isGpsActive} onValueChange={toggleGpsBackground} trackColor={{ false: '#CBD5E1', true: '#86EFAC' }} thumbColor={isGpsActive ? '#008744' : '#94A3B8'} />
                                </View>
                            </View>

                            <View style={styles.sidebarSection}>
                                {/* TUYẾN CAO TỐC */}
                                <Text style={styles.sectionLabel}>TUYẾN CAO TỐC</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={selectedExpressway}
                                        onValueChange={(val) => { setSelectedExpressway(val); setSelectedSection('ALL'); }}
                                        dropdownIconColor="#008744"
                                        style={styles.pickerSelect}
                                        itemStyle={styles.pickerItem}
                                    >
                                        {expressways.map((e) => (
                                            <Picker.Item key={e.ExpresswayId} label={`${e.NameExpressway} (${e.Symbol})`} value={e.ExpresswayId} color="#0F172A" />
                                        ))}
                                    </Picker>
                                </View>

                                {/* PHÂN ĐOẠN */}
                                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PHÂN ĐOẠN</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={selectedSection}
                                        onValueChange={(val) => {
                                            setSelectedSection(val);
                                            if (val !== 'ALL') {
                                                const sec = sections.find((s) => s.SectionId === val);
                                                if (sec?.lat && sec?.lng) flyToLocation(sec.lat, sec.lng, 12);
                                            }
                                        }}
                                        dropdownIconColor="#008744"
                                        style={styles.pickerSelect}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Tất cả phân đoạn" value="ALL" color="#0F172A" />
                                        {filteredSections.map((s) => (
                                            <Picker.Item key={s.SectionId} label={s.NameSection} value={s.SectionId} color="#0F172A" />
                                        ))}
                                    </Picker>
                                </View>

                                {/* NÚT GIAO */}
                                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>NÚT GIAO</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={selectedInterchange}
                                        onValueChange={(val) => {
                                            if (val === null) {
                                                setSelectedInterchange(null);
                                                return;
                                            }
                                            const selectedId = Number(val);
                                            const ic = allInterchanges.find((i) => Number(i.InterchangeId) === selectedId);

                                            if (ic) {
                                                setSelectedInterchange(ic);
                                                if (ic.Latitude && ic.Longitude) {
                                                    flyToLocation(Number(ic.Latitude), Number(ic.Longitude), 15);
                                                }
                                            }
                                        }}
                                        dropdownIconColor="#008744"
                                        style={styles.pickerSelect}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Chọn nút giao" value={null} color="#64748B" />
                                        {currentInterchanges.map((i) => (
                                            <Picker.Item key={i.InterchangeId} label={`${i.NameInterchange} (Km ${i.Location})`} value={i.InterchangeId} color="#0F172A" />
                                        ))}
                                    </Picker>
                                </View>

                                {/* TRẠM DỪNG CHÂN */}
                                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>TRẠM DỪNG CHÂN</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={selectedRestStop}
                                        onValueChange={(val) => {
                                            if (val === null) {
                                                setSelectedRestStop(null);
                                                return;
                                            }

                                            const selectedId = Number(val);
                                            const rs = allRestStops.find((r) => Number(r.RestStopId) === selectedId);

                                            if (rs) {
                                                setSelectedRestStop(rs);
                                                if (rs.Latitude && rs.Longitude) {
                                                    flyToLocation(Number(rs.Latitude), Number(rs.Longitude), 15);
                                                }
                                            }
                                        }}
                                        dropdownIconColor="#008744"
                                        style={styles.pickerSelect}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Chọn trạm dừng" value={null} color="#64748B" />
                                        {currentRestStops.map((r) => (
                                            <Picker.Item key={r.RestStopId} label={`${r.NameRestStop} (Km ${r.Location})`} value={r.RestStopId} color="#0F172A" />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.sidebarSection}>
                                <Text style={styles.sectionLabel}>CHÚ GIẢI TRẠNG THÁI</Text>
                                <View style={styles.legendContainer}>
                                    {[
                                        { label: 'Hoàn thành', color: '#237804' },
                                        { label: 'Đang thi công', color: '#1890ff' },
                                        { label: 'Mở rộng thi công', color: '#86c5ff' },
                                        { label: 'Chưa khởi công', color: '#faad14' },
                                        { label: 'Bảo trì', color: '#722ed1' },
                                        { label: 'Sự cố', color: '#ff4d4f' },
                                    ].map((item, idx) => (
                                        <View key={idx} style={styles.legendRow}>
                                            <View style={[styles.legendColorBar, { backgroundColor: item.color }]} />
                                            <Text style={styles.legendText}>{item.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={nearestDrawerOpen} animationType="slide" transparent={true} onRequestClose={() => setNearestDrawerOpen(false)}>
                <View style={styles.bottomDrawerOverlay}>
                    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setNearestDrawerOpen(false)} />
                    <View style={styles.bottomDrawerContent}>
                        <View style={styles.drawerHeader}>
                            <Text style={styles.sidebarTitle}>📍 Vị Trí Hạ Tầng Gần Bạn Nhất</Text>
                            <TouchableOpacity onPress={() => setNearestDrawerOpen(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {nearestInfo && (
                            <View style={{ gap: 10, marginTop: 4 }}>
                                {nearestInfo.nearestSec && (
                                    <View style={styles.nearestItem}>
                                        <Text style={styles.nearestLabel}>Phân đoạn gần nhất:</Text>
                                        <Text style={styles.nearestTitle}>{nearestInfo.nearestSec.item.NameSection}</Text>
                                        <Text style={styles.nearestDist}>Cách vị trí xe: {nearestInfo.nearestSec.dist.toFixed(1)} km</Text>
                                    </View>
                                )}

                                {nearestInfo.nearestIC && (
                                    <View style={styles.nearestItem}>
                                        <Text style={styles.nearestLabel}>🔀 Nút giao gần nhất:</Text>
                                        <Text style={styles.nearestTitle}>{nearestInfo.nearestIC.item.NameInterchange}</Text>
                                        <Text style={styles.nearestDist}>Cách vị trí xe: {nearestInfo.nearestIC.dist.toFixed(1)} km (Km {nearestInfo.nearestIC.item.Location})</Text>
                                    </View>
                                )}

                                {nearestInfo.nearestRS && (
                                    <View style={styles.nearestItem}>
                                        <Text style={styles.nearestLabel}>☕ Trạm dừng gần nhất:</Text>
                                        <Text style={styles.nearestTitle}>{nearestInfo.nearestRS.item.NameRestStop}</Text>
                                        <Text style={styles.nearestDist}>Cách vị trí xe: {nearestInfo.nearestRS.dist.toFixed(1)} km (Km {nearestInfo.nearestRS.item.Location})</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            <Modal
                visible={isFilterOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFilterOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlayRight}
                    activeOpacity={1}
                    onPress={() => setIsFilterOpen(false)}
                >
                    {/* Panel nội dung bộ lọc */}
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.rightFullSidebar}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header Panel */}
                        <View style={styles.sidebarHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="filter-sharp" size={18} color="#008744" />
                                <Text style={styles.sidebarTitle}>Bộ lọc Điểm đến</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                                <Ionicons name="close-circle" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* 🎯 NÚT GIAO XẢ */}
                        <Text style={styles.filterLabel}>NÚT GIAO XẢ</Text>

                        {/* Ô Tìm kiếm Nút giao */}
                        <View style={styles.searchBox}>
                            <Ionicons name="search-outline" size={18} color="#64748B" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm nút giao (vd: Hữu Nghị...)"
                                placeholderTextColor="#94A3B8"
                                value={searchInterchange}
                                onChangeText={setSearchInterchange}
                            />
                            {searchInterchange.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchInterchange('')}>
                                    <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Picker Nút giao (Đã làm TO RÕ và liên kết filteredInterchanges) */}
                        <View style={styles.pickerBox}>
                            <Picker
                                selectedValue={selectedInterchange?.InterchangeId ?? null}
                                onValueChange={(val) => {
                                    if (val === null) {
                                        setSelectedInterchange(null);
                                        return;
                                    }
                                    const selectedId = Number(val);
                                    const ic = allInterchanges.find((i) => Number(i.InterchangeId) === selectedId);
                                    if (ic) {
                                        setSelectedInterchange(ic);
                                        if (ic.Latitude && ic.Longitude) {
                                            flyToLocation(Number(ic.Latitude), Number(ic.Longitude), 15);
                                        }
                                    }
                                }}
                                dropdownIconColor="#008744"
                                style={styles.pickerSelect}
                                itemStyle={styles.pickerItem} // Dành cho iOS
                            >
                                <Picker.Item label="-- Chọn nút giao --" value={null} color="#64748B" style={styles.pickerItemText} />
                                {/* 🟢 Render danh sách đã lọc theo ô Search */}
                                {filteredInterchanges.map((i) => (
                                    <Picker.Item
                                        key={i.InterchangeId}
                                        label={`${i.NameInterchange} (${i.Location ? `Km ${i.Location}` : ''})`}
                                        value={i.InterchangeId}
                                        color="#0F172A"
                                        style={styles.pickerItemText}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {selectedInterchange && (
                            <View style={styles.inlineDistBadge}>
                                <Ionicons name="navigate-outline" size={14} color="#008744" />
                                <Text style={styles.inlineDistText}>
                                    {distToSelectedInterchangeKm !== null
                                        ? `Còn cách: ${distToSelectedInterchangeKm < 1
                                            ? `${Math.round(distToSelectedInterchangeKm * 1000)} m`
                                            : `${distToSelectedInterchangeKm.toFixed(1)} km`
                                        }`
                                        : '⏳ Đang định vị...'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeBadgeBtn}
                                    onPress={() => setSelectedInterchange(null)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close" size={14} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        )}


                        {/* 🏪 TRẠM DỪNG CHÂN */}
                        <Text style={[styles.filterLabel, { marginTop: 16 }]}>TRẠM DỪNG CHÂN</Text>

                        {/* Ô Tìm kiếm Trạm dừng */}
                        <View style={styles.searchBox}>
                            <Ionicons name="search-outline" size={18} color="#64748B" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm trạm dừng..."
                                placeholderTextColor="#94A3B8"
                                value={searchRestStop}
                                onChangeText={setSearchRestStop}
                            />
                            {searchRestStop.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchRestStop('')}>
                                    <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Picker Trạm dừng chân (Đã làm TO RÕ và liên kết filteredRestStops) */}
                        <View style={styles.pickerBox}>
                            <Picker
                                selectedValue={selectedRestStop?.RestStopId ?? null}
                                onValueChange={(val) => {
                                    if (val === null) {
                                        setSelectedRestStop(null);
                                        return;
                                    }
                                    const selectedId = Number(val);
                                    const rs = allRestStops.find((r) => Number(r.RestStopId) === selectedId);
                                    if (rs) {
                                        setSelectedRestStop(rs);
                                        if (rs.Latitude && rs.Longitude) {
                                            flyToLocation(Number(rs.Latitude), Number(rs.Longitude), 15);
                                        }
                                    }
                                }}
                                dropdownIconColor="#008744"
                                style={styles.pickerSelect}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="-- Chọn trạm dừng --" value={null} color="#64748B" style={styles.pickerItemText} />
                                {/* 🟢 Render danh sách đã lọc theo ô Search */}
                                {filteredRestStops.map((r) => (
                                    <Picker.Item
                                        key={r.RestStopId}
                                        label={r.NameRestStop || `Trạm dừng ${r.RestStopId}`}
                                        value={r.RestStopId}
                                        color="#0F172A"
                                        style={styles.pickerItemText}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {selectedRestStop && (
                            <View style={styles.inlineDistBadge}>
                                <Ionicons name="storefront-outline" size={14} color="#008744" />
                                <Text style={styles.inlineDistText}>
                                    {distToSelectedRestStopKm !== null
                                        ? `Còn cách: ${distToSelectedRestStopKm < 1
                                            ? `${Math.round(distToSelectedRestStopKm * 1000)} m`
                                            : `${distToSelectedRestStopKm.toFixed(1)} km`
                                        }`
                                        : '⏳ Đang định vị...'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeBadgeBtn}
                                    onPress={() => setSelectedRestStop(null)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close" size={14} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Nút Xóa bộ lọc / Đóng */}
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={() => setIsFilterOpen(false)}
                        >
                            <Text style={styles.applyBtnText}>Đóng & Theo dõi</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>


            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    mapContainer: { flex: 1, position: 'relative' },
    webview: { flex: 1 },
    loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },

    topActionGroup: { position: 'absolute', top: 16, right: 16, zIndex: 100, flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, gap: 4 },
    actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },

    floatingSpeedBadge: { position: 'absolute', bottom: 16, left: 16, zIndex: 100, backgroundColor: '#FFFFFF', width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#008744', elevation: 4 },
    speedValueText: { fontSize: 18, fontWeight: 'bold', color: '#008744' },
    speedUnitText: { fontSize: 9, fontWeight: '700', color: '#64748B' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', flexDirection: 'row' },
    backdrop: { flex: 1 },
    sidebarContent: { width: 310, backgroundColor: '#FFFFFF', height: '100%', paddingHorizontal: 16 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    sidebarTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
    sidebarSection: { marginTop: 14 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 6 },
    sidebarItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    itemIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
    itemTextBox: { flex: 1, marginRight: 8 },
    itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
    itemSub: { fontSize: 10, color: '#64748B', marginTop: 2 },
    pickerBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        overflow: 'hidden',
        justifyContent: 'center',
    },

    legendContainer: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, gap: 6 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendColorBar: { width: 20, height: 4, borderRadius: 2 },
    legendText: { fontSize: 12, color: '#334155' },

    bottomDrawerOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    bottomDrawerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '55%' },
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    nearestItem: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    nearestLabel: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
    nearestTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },
    nearestDist: { fontSize: 11, color: '#008744', marginTop: 2 },
    pickerSelect: {
        width: '100%',
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
    },
    pickerItem: {
        fontSize: 14,
        height: 120,
        color: '#0F172A',
    },
    // 🟢 Style cho nhóm biển báo tốc độ góc trên bên trái
    topSpeedLimitGroup: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
        flexDirection: 'row',
        gap: 10,
    },

    // 🔴 Biển báo Tốc độ tối đa (Viền đỏ dày, nền trắng, số đen)
    maxSpeedCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        borderWidth: 4,
        borderColor: '#E11D48', // Màu đỏ biển báo P.127
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    speedLimitValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0F172A',
        lineHeight: 20,
    },
    speedLimitLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: '#E11D48',
        marginTop: -1,
    },

    // 🔵 Biển báo Tốc độ tối thiểu (Nền xanh dương, chữ trắng chuẩn biển R.306)
    minSpeedCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2563EB',
        borderWidth: 3,
        borderColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    speedLimitValueBlue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 20,
    },
    speedLimitLabelBlue: {
        fontSize: 8,
        fontWeight: '800',
        color: '#DBEAFE',
        marginTop: -1,
    },

    tunnelBorder: {
        borderColor: '#E11D48',
        borderWidth: 5,
        shadowColor: '#F59E0B',
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },

    tunnelBorderBlue: {
        borderColor: '#60A5FA',
        borderWidth: 4,
    },

    // 3. Panel Sidebar Bộ lọc
    filterFloatingBtn: {
        position: 'absolute',
        bottom: 35,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#008744',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.5,
        zIndex: 999,
    },
    activeFilterDot: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    // Overlay phủ toàn màn hình, đẩy Sidebar sang lề phải
    modalOverlayRight: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        flexDirection: 'row',
        justifyContent: 'flex-end', // Đẩy panel sát mép phải
    },

    // Panel Sidebar bên phải: Không bo góc (borderRadius: 0), chiều cao 100%
    rightFullSidebar: {
        width: 260,               // Độ rộng Sidebar vừa đẹp cho màn hình
        height: '100%',           // Kéo dài full chiều cao màn hình
        backgroundColor: '#FFFFFF',
        borderRadius: 0,          // Không bo góc theo yêu cầu
        padding: 16,
        paddingTop: 45,           // Đệm cách mép trên để tránh thanh trạng thái
        shadowColor: '#000',
        shadowOffset: { width: -3, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 6,
        textTransform: 'uppercase',
    },

    distBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
        backgroundColor: '#0284C7',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    distBadgeText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
    applyBtn: {
        marginTop: 20,
        backgroundColor: '#008744',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        paddingVertical: 0,
        marginLeft: 8,
    },
    pickerItemText: {
        fontSize: 15,
        color: "#0F172A"
    },
    inlineDistBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#E6F4EA', // Nền xanh lá nhạt cho dịu mắt
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#C6E7D2',
    },
    inlineDistText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#008744',
    },
    closeBadgeBtn: {
        padding: 2,
        borderRadius: 10,
        backgroundColor: '#CBD5E1', // Tròn màu xám nhạt dễ bấm
        justifyContent: 'center',
        alignItems: 'center',
    },
});
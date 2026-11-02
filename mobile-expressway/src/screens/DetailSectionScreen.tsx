import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import MapComponent from '../components/MapComponent';
import axiosClient from '../api/axiosClient';
import {
    SectionDetail,
    InterchangeItem,
    RestStopItem,
    BridgeItem,
    TunnelItem,
    ProvinceItem,
} from '../types/section';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function DetailSectionScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const currentId = route.params?.id;

    const [data, setData] = useState<SectionDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'1' | '2' | '3' | '4'>('1');
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    useEffect(() => {
        const fetchSectionDetail = async () => {
            if (!currentId) return;

            try {
                setLoading(true);
                setError(null);

                const res = await axiosClient.get(`/sections/${currentId}`);
                const result = res.data;
                const sectionData = result?.data || result;

                if (Array.isArray(sectionData)) {
                    const found = sectionData.find(
                        (item: SectionDetail) => String(item.SectionId) === String(currentId)
                    );
                    setData(found || sectionData[0] || null);
                } else {
                    setData(sectionData);
                }
            } catch (err: any) {
                console.error('Lỗi chi tiết tuyến đường:', err);
                setError(err.message || 'Có lỗi xảy ra khi kết nối tới máy chủ');
            } finally {
                setLoading(false);
            }
        };

        fetchSectionDetail();
    }, [currentId]);

    const getImageUrl = (path?: string | null) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
    };

    const getStatusProps = (status: string) => {
        switch (status) {
            case 'Complete':
                return { color: '#15803D', bg: '#DCFCE7', text: t('expressway.complete', 'Hoàn thành') };
            case 'Under construction':
                return { color: '#1D4ED8', bg: '#DBEAFE', text: t('expressway.underConstruction', 'Đang thi công') };
            case 'Extend under construction':
                return { color: '#0284C7', bg: '#E0F2FE', text: t('expressway.extendUnderConstruction', 'Đang mở rộng') };
            case 'Not yet construction':
                return { color: '#D97706', bg: '#FEF3C7', text: t('expressway.notYetConstruction', 'Chưa thi công') };
            case 'Incident':
                return { color: '#B91C1C', bg: '#FEE2E2', text: t('expressway.incident', 'Sự cố') };
            case 'Maintenance':
                return { color: '#6D28D9', bg: '#F3E8FF', text: t('expressway.maintenance', 'Bảo trì') };
            default:
                return { color: '#4B5563', bg: '#F3F4F6', text: status || 'Chưa xác định' };
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#008744" />
                    <Text style={styles.loadingText}>Đang tải chi tiết tuyến đường...</Text>
                </View>
                <Footer />
            </View>
        );
    }

    if (error || !data) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
                    <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin tuyến đường.'}</Text>
                    <TouchableOpacity
                        style={styles.backButtonBtn}
                        onPress={() => navigation.navigate('SectionScreen')}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
                <Footer />
            </View>
        );
    }

    const statusProps = getStatusProps(data.Status);

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nút Quay Lại & Tiêu Đề */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('SectionScreen')}
                    >
                        <Ionicons name="arrow-back" size={22} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle} numberOfLines={1}>
                        {data.NameSection}
                    </Text>
                </View>

                {/* Khối Hình Ảnh & Bản Đồ */}
                <View style={styles.mediaContainer}>
                    {data.Image && (
                        <View style={styles.mediaCard}>
                            <Text style={styles.mediaTitle}>Hình ảnh tuyến đường</Text>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: getImageUrl(data.Image) }}
                                    style={styles.mediaImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    )}

                    {data.SpeedSign && (
                        <View style={styles.mediaCard}>
                            <Text style={styles.mediaTitle}>Biển báo tốc độ quy định</Text>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: getImageUrl(data.SpeedSign) }}
                                    style={styles.mediaImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.mediaCard}>
                        <View style={styles.mapHeaderRow}>
                            <Text style={styles.mediaTitle}>Bản đồ phân đoạn tuyến đường</Text>
                            <TouchableOpacity
                                style={styles.fullscreenBtn}
                                onPress={() => setIsFullscreen(true)}
                            >
                                <Ionicons name="expand-outline" size={16} color="#008744" />
                                <Text style={styles.fullscreenBtnText}>{t('home.fullScreen', 'Xem toàn màn hình')}</Text>
                            </TouchableOpacity>
                        </View>

                        <MapComponent geojsonData={data.MapData} height={240} />
                    </View>
                </View>

                {/* Thông tin Chi Tiết */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="compass" size={22} color="#008744" />
                        <Text style={styles.cardHeaderTitle}>{t('section.sectionDetail', 'Thông tin chi tiết')}</Text>
                    </View>

                    <View style={styles.infoTable}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('expressway.name', 'Tên tuyến')}</Text>
                            <Text style={styles.infoValueName}>{data.NameSection}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('expressway.province', 'Tỉnh/Thành')}</Text>
                            <View style={styles.tagWrap}>
                                {data.province?.map((p: ProvinceItem) => (
                                    <View key={p.ProvinceId} style={styles.provinceTag}>
                                        <Text style={styles.provinceTagText}>{p.ProvinceName}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('home.totalLength', 'Chiều dài')}</Text>
                            <Text style={styles.infoValue}>{data.Length} km</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('section.speed', 'Tốc độ')}</Text>
                            <Text style={styles.infoValue}>{data.SpeedLimit || 'Theo biển báo'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('section.routeMarkers', 'Lộ trình')}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoValueSmall}>
                                    IC {data.StartLocation} (Km {data.StartKm})
                                </Text>
                                <Ionicons name="arrow-down" size={14} color="#94A3B8" style={{ marginVertical: 2 }} />
                                <Text style={styles.infoValueSmall}>
                                    IC {data.EndLocation} (Km {data.EndKm})
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t('section.laneConfiguration', 'Quy mô làn')}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoValue}>{data.TrafficLand} làn xe</Text>
                                {data.HasEmergencyLand && (
                                    <View style={styles.emergencyRow}>
                                        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                                        <Text style={styles.emergencyText}>{t('section.emergencyLand', 'Có làn khẩn cấp')}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.infoLabel}>{t('expressway.status', 'Trạng thái')}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusProps.bg }]}>
                                <Text style={[styles.statusBadgeText, { color: statusProps.color }]}>{statusProps.text}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tabs Sub-Items */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === '1' && styles.tabItemActive]}
                        onPress={() => setActiveTab('1')}
                    >
                        <FontAwesome5 name="code-branch" size={13} color={activeTab === '1' ? '#008744' : '#64748B'} />
                        <Text style={[styles.tabText, activeTab === '1' && styles.tabTextActive]}>
                            Nút giao ({data.interchange?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === '2' && styles.tabItemActive]}
                        onPress={() => setActiveTab('2')}
                    >
                        <FontAwesome5 name="gas-pump" size={13} color={activeTab === '2' ? '#008744' : '#64748B'} />
                        <Text style={[styles.tabText, activeTab === '2' && styles.tabTextActive]}>
                            Trạm dừng ({data.restStop?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === '3' && styles.tabItemActive]}
                        onPress={() => setActiveTab('3')}
                    >
                        <FontAwesome5 name="road" size={13} color={activeTab === '3' ? '#008744' : '#64748B'} />
                        <Text style={[styles.tabText, activeTab === '3' && styles.tabTextActive]}>
                            Cầu ({data.bridge?.length || 0})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === '4' && styles.tabItemActive]}
                        onPress={() => setActiveTab('4')}
                    >
                        <MaterialCommunityIcons name="tunnel" size={15} color={activeTab === '4' ? '#008744' : '#64748B'} />
                        <Text style={[styles.tabText, activeTab === '4' && styles.tabTextActive]}>
                            Hầm ({data.tunnel?.length || 0})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Nội dung Tab */}
                <View style={styles.tabContentContainer}>
                    {activeTab === '1' && (
                        <View>
                            {data.interchange && data.interchange.length > 0 ? (
                                data.interchange.map((item: InterchangeItem) => (
                                    <View key={item.InterchangeId} style={styles.subCard}>
                                        <View style={styles.subCardHeader}>
                                            <Text style={styles.subCardTitle}>{item.NameInterchange}</Text>
                                            <View style={styles.kmBadge}>
                                                <Text style={styles.kmBadgeText}>
                                                    {item.Location?.startsWith('Km') ? item.Location : `Km ${item.Location}`}
                                                </Text>
                                            </View>
                                        </View>
                                        {item.Type ? <Text style={styles.subCardSubText}>Loại: {item.Type}</Text> : null}
                                        {item.Connection ? (
                                            <Text style={styles.subCardSubText}>Kết nối: {item.Connection}</Text>
                                        ) : null}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyTabText}>Chưa có dữ liệu nút giao.</Text>
                            )}
                        </View>
                    )}

                    {activeTab === '2' && (
                        <View>
                            {data.restStop && data.restStop.length > 0 ? (
                                data.restStop.map((item: RestStopItem) => (
                                    <View key={item.RestStopId} style={styles.subCard}>
                                        <View style={styles.subCardHeader}>
                                            <Text style={styles.subCardTitle}>{item.NameRestStop}</Text>
                                            <View style={[styles.kmBadge, { backgroundColor: '#DCFCE7' }]}>
                                                <Text style={[styles.kmBadgeText, { color: '#15803D' }]}>
                                                    {item.Location?.startsWith('Km') ? item.Location : `Km ${item.Location}`}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.serviceRow}>
                                            {item.HasPetrol && <Text style={styles.serviceTag}>⛽ Xăng dầu</Text>}
                                            {item.HasFood && <Text style={styles.serviceTag}>🍽️ Ăn uống</Text>}
                                            {item.HasToilet && <Text style={styles.serviceTag}>🚾 Vệ sinh</Text>}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyTabText}>Chưa có trạm dừng nghỉ.</Text>
                            )}
                        </View>
                    )}

                    {activeTab === '3' && (
                        <View>
                            {data.bridge && data.bridge.length > 0 ? (
                                data.bridge.map((item: BridgeItem, index: number) => (
                                    <View key={item.BridgeId || index} style={styles.subCard}>
                                        <View style={styles.subCardHeader}>
                                            <Text style={styles.subCardTitle}>{item.NameBridge}</Text>
                                            {item.LengthMeter !== undefined && (
                                                <Text style={styles.lengthText}>{item.LengthMeter} m</Text>
                                            )}
                                        </View>
                                        {item.Location ? (
                                            <Text style={styles.subCardSubText}>Vị trí: {item.Location}</Text>
                                        ) : null}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyTabText}>Chưa có dữ liệu cầu.</Text>
                            )}
                        </View>
                    )}

                    {activeTab === '4' && (
                        <View>
                            {data.tunnel && data.tunnel.length > 0 ? (
                                data.tunnel.map((item: TunnelItem, index: number) => (
                                    <View key={item.TunnelId || index} style={styles.subCard}>
                                        <View style={styles.subCardHeader}>
                                            <Text style={styles.subCardTitle}>{item.NameTunnel}</Text>
                                            {item.LengthMeter !== undefined && (
                                                <Text style={styles.lengthText}>{item.LengthMeter} m</Text>
                                            )}
                                        </View>
                                        {item.Location ? (
                                            <Text style={styles.subCardSubText}>Vị trí: {item.Location}</Text>
                                        ) : null}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyTabText}>Tuyến đường không có hầm.</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Footer />

            {/* 🟢 MODAL XEM BẢN ĐỒ FULLSCREEN CÓ SAFE AREA FIX NOTCH */}
            <Modal visible={isFullscreen} animationType="slide" hardwareAccelerated statusBarTranslucent>
                <View style={styles.fullScreenModalContainer}>
                    <StatusBar barStyle="light-content"/>

                    {/* Thanh Header Đóng Bản Đồ tự động đẩy xuống dưới Tai Thỏ */}
                    <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44) }]}>
                        <TouchableOpacity
                            style={styles.closeModalBtn}
                            onPress={() => setIsFullscreen(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.closeModalText}>Đóng bản đồ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Khung chứa bản đồ */}
                    <View style={{ flex: 1 }}>
                        {data && <MapComponent geojsonData={data.MapData} height="100%" />}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, color: '#64748B', fontSize: 14 },
    errorText: { marginTop: 12, color: '#DC2626', fontSize: 15, textAlign: 'center', marginBottom: 16 },
    backButtonBtn: { backgroundColor: '#008744', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    backButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    screenTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', flex: 1 },
    mediaContainer: { gap: 12, marginBottom: 14 },
    mediaCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    mediaTitle: { fontSize: 13, fontWeight: '600', color: '#475569' },
    mapHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    fullscreenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    fullscreenBtnText: { fontSize: 11, fontWeight: '600', color: '#008744' },
    fullScreenModalContainer: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    modalHeader: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeModalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#334155',
        borderRadius: 8,
    },
    closeModalText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    imageWrapper: { height: 150, backgroundColor: '#004F9F', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    mediaImage: { width: '100%', height: '100%' },
    infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 10 },
    cardHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
    infoTable: { gap: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    infoLabel: { width: 90, fontSize: 13, color: '#64748B', fontWeight: '500' },
    infoValueName: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#008744' },
    infoValue: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
    infoValueSmall: { fontSize: 12, color: '#334155', fontWeight: '500' },
    tagWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    provinceTag: { backgroundColor: '#FFEDD5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    provinceTagText: { fontSize: 11, color: '#EA580C', fontWeight: '600' },
    emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    emergencyText: { fontSize: 12, color: '#16A34A' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    statusBadgeText: { fontSize: 11, fontWeight: '700' },
    tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 4 },
    tabItemActive: { backgroundColor: '#F0FDF4' },
    tabText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    tabTextActive: { color: '#008744', fontWeight: 'bold' },
    tabContentContainer: { paddingBottom: 20 },
    subCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    subCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', flex: 1 },
    kmBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    kmBadgeText: { fontSize: 11, color: '#1D4ED8', fontWeight: '700' },
    subCardSubText: { fontSize: 12, color: '#64748B', marginTop: 2 },
    serviceRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    serviceTag: { fontSize: 11, color: '#334155', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    lengthText: { fontSize: 12, fontWeight: 'bold', color: '#2563EB' },
    emptyTabText: { textAlign: 'center', color: '#94A3B8', marginVertical: 20, fontSize: 13 },
});
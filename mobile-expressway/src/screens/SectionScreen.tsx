import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal, ScrollView, Alert, useWindowDimensions, LayoutAnimation, Platform, UIManager, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import axiosClient from '../api/axiosClient';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PROVINCE_OPTIONS = [
    { value: 'Hà Nội City', label: 'Hà Nội' },
    { value: 'Cao Bằng Province', label: 'Cao Bằng' },
    { value: 'Tuyên Quang Province', label: 'Tuyên Quang' },
    { value: 'Điện Biên Province', label: 'Điện Biên' },
    { value: 'Lai Châu Province', label: 'Lai Châu' },
    { value: 'Sơn La Province', label: 'Sơn La' },
    { value: 'Lào Cai Province', label: 'Lào Cai' },
    { value: 'Thái Nguyên Province', label: 'Thái Nguyên' },
    { value: 'Lạng Sơn Province', label: 'Lạng Sơn' },
    { value: 'Quảng Ninh Province', label: 'Quảng Ninh' },
    { value: 'Bắc Ninh Province', label: 'Bắc Ninh' },
    { value: 'Phú Thọ Province', label: 'Phú Thọ' },
    { value: 'Hải Phòng City', label: 'Hải Phòng' },
    { value: 'Hưng Yên Province', label: 'Hưng Yên' },
    { value: 'Ninh Bình Province', label: 'Ninh Bình' },
    { value: 'Thanh Hóa Province', label: 'Thanh Hóa' },
    { value: 'Nghệ An Province', label: 'Nghệ An' },
    { value: 'Hà Tĩnh Province', label: 'Hà Tĩnh' },
    { value: 'Quảng Trị Province', label: 'Quảng Trị' },
    { value: 'Huế City', label: 'Huế' },
    { value: 'Đà Nẵng City', label: 'Đà Nẵng' },
    { value: 'Quảng Ngãi Province', label: 'Quảng Ngãi' },
    { value: 'Gia Lai Province', label: 'Gia Lai' },
    { value: 'Khánh Hòa Province', label: 'Khánh Hòa' },
    { value: 'Đắk Lắk Province', label: 'Đắk Lắk' },
    { value: 'Lâm Đồng Province', label: 'Lâm Đồng' },
    { value: 'Đồng Nai City', label: 'Đồng Nai' },
    { value: 'Hồ Chí Minh City', label: 'Hồ Chí Minh' },
    { value: 'Tây Ninh Province', label: 'Tây Ninh' },
    { value: 'Đồng Tháp Province', label: 'Đồng Tháp' },
    { value: 'Vĩnh Long Province', label: 'Vĩnh Long' },
    { value: 'An Giang Province', label: 'An Giang' },
    { value: 'Cần Thơ City', label: 'Cần Thơ' },
    { value: 'Cà Mau Province', label: 'Cà Mau' },
];

interface Section {
    SectionId: number;
    NameSection: string;
    Image?: string;
    Length: number;
    StartLocation: string;
    StartKm?: number;
    EndLocation: string;
    EndKm?: number;
    Status?: string;
    interchangeCount?: number;
    restStopCount?: number;
}

export default function SectionScreen() {

    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const numColumns = isTablet ? 2 : 1;

    const gap = 16;
    const paddingHorizontal = 16;
    const cardWidth = isTablet
        ? (width - paddingHorizontal * 2 - gap) / 2
        : width - paddingHorizontal * 2;

    const handleOpenDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const animationController = useRef(new Animated.Value(0)).current;

    // 🟢 3. Hàm toggle mượt mà với Animated.timing
    const toggleFilter = () => {
        if (showFilter) {
            // Đóng bộ lọc
            Animated.timing(animationController, {
                toValue: 0,
                duration: 250, // Thời gian trượt lên (ms)
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false, // Bắt buộc false vì animate height/margin
            }).start(() => setShowFilter(false));
        } else {
            // Mở bộ lọc
            setShowFilter(true);
            Animated.timing(animationController, {
                toValue: 1,
                duration: 300, // Thời gian xổ xuống (ms)
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false,
            }).start();
        }
    };

    // Interpolate tạo chiều cao & độ mờ mượt mà
    const filterOpacity = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const filterScale = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
    });

    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
    const [filterProvince, setFilterProvince] = useState<string>('');
    const [filterKm, setFilterKm] = useState<string>('');
    const [provinceModalVisible, setProvinceModalVisible] = useState<boolean>(false);
    const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);

    const STATUS_OPTIONS = [
        { value: 'Not yet construction', label: t('expressway.notYetConstruction', 'Chưa thi công') },
        { value: 'Complete', label: t('expressway.complete', 'Hoàn thành') },
        { value: 'Under construction', label: t('expressway.underConstruction', 'Đang thi công') },
        { value: 'Extend under construction', label: t('expressway.extendUnderConstruction', 'Đang mở rộng') },
        { value: 'Incident', label: t('expressway.incident', 'Sự cố') },
        { value: 'Maintenance', label: t('expressway.maintenance', 'Bảo trì') },
    ];

    const fetchAllSections = async () => {
        setLoading(true);
        try {
            const [sectionsRes, statsRes] = await Promise.all([
                axiosClient.get('/sections'),
                axiosClient.get('/sections/statistics').catch(() => ({ data: [] })),
            ]);

            handleSetData(sectionsRes.data, statsRes.data);
        } catch (err) {
            console.error('Lỗi lấy danh sách đoạn đường:', err);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSections();
    }, []);

    const handleSetData = (rawData: any, statsData?: any[]) => {
        let extractedArray: any[] = [];
        if (!rawData) {
            setSections([]);
            return;
        }

        if (rawData.data && rawData.data.data) {
            extractedArray = Array.isArray(rawData.data.data) ? rawData.data.data : [rawData.data.data];
        } else if (rawData.data && Array.isArray(rawData.data)) {
            extractedArray = rawData.data;
        } else if (Array.isArray(rawData)) {
            extractedArray = rawData;
        } else if (rawData.result && Array.isArray(rawData.result)) {
            extractedArray = rawData.result;
        }

        const normalizedArray = extractedArray.map((item: any) => {
            const sectionId = item.SectionId ?? item.sectionId ?? item.id;
            const sectionStats = Array.isArray(statsData)
                ? statsData.find((stat: any) => String(stat.id) === String(sectionId))
                : null;

            return {
                SectionId: Number(sectionId),
                NameSection: item.NameSection ?? item.Namesection ?? item.nameSection ?? item.name ?? 'Không có tên',
                Image: item.Image ?? item.image,
                Length: item.Length ?? item.length ?? 0,
                StartLocation: item.StartLocation ?? item.startLocation ?? 'Chưa xác định',
                StartKm: item.StartKm ?? item.startKm,
                EndLocation: item.EndLocation ?? item.endLocation ?? 'Chưa xác định',
                EndKm: item.EndKm ?? item.endKm,
                Status: item.Status ?? item.status,
                interchangeCount:
                    sectionStats?.interchangeCount !== undefined
                        ? Number(sectionStats.interchangeCount)
                        : item.interchange?.length || item.interchanges?.length || 0,
                restStopCount:
                    sectionStats?.restStopCount !== undefined
                        ? Number(sectionStats.restStopCount)
                        : item.restStops?.length || item.restStop?.length || 0,
            };
        });

        setSections(normalizedArray);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const headers = { 'accept-language': 'vi' };
            const statsRes = await axiosClient.get('/sections/statistics').catch(() => ({ data: [] }));

            if (filterKm.trim() !== '') {
                const res = await axiosClient.get('/sections/kilometre', {
                    params: { km: filterKm.trim() },
                    headers,
                });
                handleSetData(res.data, statsRes.data);
            } else if (filterName.trim() || filterStatus || filterProvince.trim()) {
                const params: any = {};
                if (filterName.trim()) params.name = filterName.trim();
                if (filterStatus) params.status = filterStatus;
                if (filterProvince.trim()) params.provinceName = filterProvince.trim();

                const res = await axiosClient.get('/sections/search', {
                    params,
                    headers,
                });
                handleSetData(res.data, statsRes.data);
            } else {
                await fetchAllSections();
            }
        } catch (err) {
            console.error('Lỗi tìm kiếm:', err);
            setSections([]);
            Alert.alert('Thông báo', 'Không tìm thấy kết quả phù hợp');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilterName('');
        setFilterStatus(undefined);
        setFilterProvince('');
        setFilterKm('');
        fetchAllSections();
    };

    const getSectionStatusProps = (status: string | undefined) => {
        switch (status) {
            case 'Not yet construction':
                return { color: '#D97706', bg: '#FEF3C7', text: t('expressway.notYetConstruction', 'Chưa thi công') };
            case 'Complete':
                return { color: '#15803D', bg: '#DCFCE7', text: t('expressway.complete', 'Hoàn thành') };
            case 'Under construction':
                return { color: '#1D4ED8', bg: '#DBEAFE', text: t('expressway.underConstruction', 'Đang thi công') };
            case 'Extend under construction':
                return { color: '#0284C7', bg: '#E0F2FE', text: t('expressway.extendUnderConstruction', 'Đang mở rộng') };
            case 'Incident':
                return { color: '#B91C1C', bg: '#FEE2E2', text: t('expressway.incident', 'Sự cố') };
            case 'Maintenance':
                return { color: '#6D28D9', bg: '#F3E8FF', text: t('expressway.maintenance', 'Bảo trì') };
            default:
                return { color: '#4B5563', bg: '#F3F4F6', text: status || 'Chưa xác định' };
        }
    };

    const renderSectionItem = ({ item }: { item: Section }) => {
        const fullImageUrl = item.Image && item.Image.startsWith('http') ? item.Image : `${baseUrl}/${item.Image}`;
        const statusProps = getSectionStatusProps(item.Status);

        return (
            <TouchableOpacity
                style={[styles.card, { width: cardWidth }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('DetailSectionScreen', { id: item.SectionId })}
            >
                <View style={styles.cardImageWrapper}>
                    <Image
                        source={{ uri: item.Image ? fullImageUrl : 'https://placehold.co/600x300?text=No+Image' }}
                        style={styles.cardImage}
                        resizeMode="contain"
                    />
                    <View style={[styles.statusBadge, { backgroundColor: statusProps.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusProps.color }]}>{statusProps.text}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {t('expressway.expressway', 'Cao tốc')} {item.NameSection}
                        </Text>
                        <View style={styles.lengthTag}>
                            <Text style={styles.lengthTagText}>{item.Length} km</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={16} color="#16A34A" />
                        <Text style={styles.infoLabel}>{t('expressway.start', 'Điểm đầu')}: </Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            IC {item.StartLocation} {item.StartKm !== undefined ? `(Km ${item.StartKm})` : ''}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={16} color="#DC2626" />
                        <Text style={styles.infoLabel}>{t('expressway.end', 'Điểm cuối')}: </Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            IC {item.EndLocation} {item.EndKm !== undefined ? `(Km ${item.EndKm})` : ''}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="compass-outline" size={16} color="#2563EB" />
                            <Text style={styles.statText}>
                                {t('expressway.interchange', 'Nút giao')}: <Text style={styles.boldText}>{item.interchangeCount}</Text>
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="gas-station-outline" size={16} color="#475569" />
                            <Text style={styles.statText}>
                                {t('expressway.restStop', 'Trạm dừng')}: <Text style={styles.boldText}>{item.restStopCount}</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <View style={styles.container}>
            <Header
                onOpenDrawer={handleOpenDrawer}
            />
            <View style={styles.content}>
                {/* Tiêu đề & Nút bật bộ lọc */}
                <View style={styles.headerSection}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {t('expressway.title', 'DANH SÁCH TUYẾN ĐƯỜNG')}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={2}>
                            {t('expressway.text', 'Tra cứu thông tin các phân đoạn cao tốc')}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.filterToggleBtn, showFilter && styles.filterToggleBtnActive]}
                        onPress={toggleFilter}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={showFilter ? 'close-outline' : 'options-outline'}
                            size={20}
                            color={showFilter ? '#FFFFFF' : '#008744'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Khối Bộ Lọc Lọc */}
                {showFilter && (
                    <Animated.View
                        style={[
                            styles.filterCard,
                            {
                                opacity: filterOpacity,
                                transform: [{ scaleY: filterScale }],
                            },
                        ]}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('expressway.name', 'Tên tuyến cao tốc')}:</Text>
                            <TextInput
                                style={[styles.input, !!filterKm && styles.disabledInput]}
                                placeholder="Nhập tên tuyến..."
                                value={filterName}
                                onChangeText={setFilterName}
                                editable={!filterKm}
                            />
                        </View>

                        <View style={styles.rowTwoCols}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>{t('expressway.status', 'Trạng thái')}:</Text>
                                <TouchableOpacity
                                    style={[styles.selectInput, !!filterKm && styles.disabledInput]}
                                    disabled={!!filterKm}
                                    onPress={() => setStatusModalVisible(true)}
                                >
                                    <Text style={styles.selectText} numberOfLines={1}>
                                        {STATUS_OPTIONS.find((s) => s.value === filterStatus)?.label || 'Tất cả trạng thái'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>{t('expressway.province', 'Tỉnh/Thành')}:</Text>
                                <TouchableOpacity
                                    style={[styles.selectInput, !!filterKm && styles.disabledInput]}
                                    disabled={!!filterKm}
                                    onPress={() => setProvinceModalVisible(true)}
                                >
                                    <Text style={styles.selectText} numberOfLines={1}>
                                        {PROVINCE_OPTIONS.find((p) => p.value === filterProvince)?.label || 'Tất cả tỉnh thành'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={16} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('expressway.kilometer', 'Tra cứu theo Km')}:</Text>
                            <TextInput
                                style={[styles.input, !!(filterName || filterStatus || filterProvince) && styles.disabledInput]}
                                placeholder="Nhập vị trí Km (ví dụ: 45)..."
                                keyboardType="numeric"
                                value={filterKm}
                                onChangeText={setFilterKm}
                                editable={!(filterName || filterStatus || filterProvince)}
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                                <Ionicons name="refresh" size={18} color="#475569" />
                                <Text style={styles.resetBtnText}>{t('expressway.reset', 'Đặt lại')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                                <Ionicons name="search" size={18} color="#FFFFFF" />
                                <Text style={styles.searchBtnText}>{t('expressway.search', 'Tìm kiếm')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Danh sách Tuyến Đường */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#008744" />
                        <Text style={styles.loadingText}>Đang lấy dữ liệu tuyến đường...</Text>
                    </View>
                ) : sections.length > 0 ? (
                    <FlatList
                        key={`section-list-${numColumns}`}
                        numColumns={numColumns}
                        data={sections}
                        columnWrapperStyle={isTablet ? { gap } : undefined}
                        keyExtractor={(item) => item.SectionId.toString()}
                        renderItem={renderSectionItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="map-outline" size={56} color="#CBD5E0" />
                        <Text style={styles.emptyText}>Không tìm thấy phân đoạn cao tốc nào phù hợp.</Text>
                    </View>
                )}
            </View>
            <Footer />

            <Modal visible={statusModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setStatusModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn trạng thái</Text>
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                setFilterStatus(undefined);
                                setStatusModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalItemText}>-- Tất cả trạng thái --</Text>
                        </TouchableOpacity>
                        {STATUS_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={styles.modalItem}
                                onPress={() => {
                                    setFilterStatus(item.value);
                                    setStatusModalVisible(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, filterStatus === item.value && styles.selectedModalText]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal Chọn Tỉnh Thành */}
            <Modal visible={provinceModalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProvinceModalVisible(false)}>
                    <View style={[styles.modalContent, { maxHeight: '70%' }]}>
                        <Text style={styles.modalTitle}>Chọn Tỉnh / Thành phố</Text>
                        <ScrollView>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setFilterProvince('');
                                    setProvinceModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>-- Tất cả tỉnh thành --</Text>
                            </TouchableOpacity>
                            {PROVINCE_OPTIONS.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setFilterProvince(item.value);
                                        setProvinceModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, filterProvince === item.value && styles.selectedModalText]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%'
    },
    titleContainer: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    filterToggleBtn: {
        width: 38,
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#008744',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        flexShrink: 0,
    },
    filterToggleBtnActive: {
        backgroundColor: '#008744',
    },
    filterCard: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 10,
        overflow: 'hidden'
    },
    inputGroup: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 13,
        color: '#1E293B',
        backgroundColor: '#FFFFFF',
    },
    selectInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    selectText: {
        fontSize: 13,
        color: '#1E293B',
        flex: 1,
    },
    disabledInput: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        color: '#94A3B8',
    },
    rowTwoCols: {
        flexDirection: 'row',
        gap: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    resetBtn: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
    },
    resetBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    searchBtn: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        backgroundColor: '#008744',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    searchBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    listContainer: {
        paddingBottom: 16,
        gap: 14,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardImageWrapper: {
        height: 140,
        position: 'relative',
        backgroundColor: '#E2E8F0',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardBody: {
        padding: 14,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        flex: 1,
        marginRight: 8,
    },
    lengthTag: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    lengthTagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1D4ED8',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 6,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#64748B',
    },
    boldText: {
        fontWeight: '700',
        color: '#0F172A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#64748B',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalItemText: {
        fontSize: 14,
        color: '#334155',
    },
    selectedModalText: {
        color: '#008744',
        fontWeight: 'bold',
    },
});
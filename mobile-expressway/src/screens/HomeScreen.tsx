import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

import { Header } from '../components/Header';
import Footer from '../components/Footer';
import MapHome from '../components/MapHome';

const { width } = Dimensions.get('window');
const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    // State Dữ liệu
    const [heroImages, setHeroImages] = useState<string[]>([]);
    const [statsData, setStatsData] = useState<any>(null);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [routesData, setRoutesData] = useState<any[]>([]);
    const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
    const [score, setScore] = useState<number>(95);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
    const flatListRef = useRef<FlatList>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const selectedExpressway = routesData.find((item) => item.ExpresswayId === activeRouteId);

    const fetchHeroImages = async () => {
        try {
            const res = await fetch(`${baseUrl}/uploads/`);
            const result = await res.json();
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                const fullUrls = result.data.map((file: string) => `${baseUrl}/uploads/images/${file}`);
                setHeroImages(fullUrls);
            } else {
                setHeroImages(['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800']);
            }
        } catch (error) {
            setHeroImages(['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800']);
        }
    };

    // 2. Tải Dữ liệu Thống kê, Sự cố, Bảo trì
    const fetchAllData = async () => {
        try {
            const [resStats, resIncident, resMaintenance] = await Promise.all([
                fetch(`${baseUrl}/expressways/statistics`),
                fetch(`${baseUrl}/sections/search?status=Incident`),
                fetch(`${baseUrl}/sections/search?status=Maintenance`),
            ]);

            if (resStats.ok) {
                const resultStats = await resStats.json();
                setStatsData(resultStats.data || resultStats);
            }

            if (resIncident.ok) {
                const dataIncident = await resIncident.json();
                setIncidents(dataIncident?.data?.data || dataIncident?.data || []);
            }

            if (resMaintenance.ok) {
                const dataMaintenance = await resMaintenance.json();
                setMaintenances(dataMaintenance?.data?.data || dataMaintenance?.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu thống kê:', error);
        }
    };

    const fetchExpressways = async () => {
        try {
            const res = await axiosClient.get('/expressways');
            const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : res.data?.data || [];
            setRoutesData(data);
            if (data.length > 0) {
                setActiveRouteId(data[0].ExpresswayId);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách cao tốc:', error);
        }
    };

    const fetchScore = async () => {
        try {
            const savedScore = await AsyncStorage.getItem('app_safety_score');
            if (savedScore !== null) {
                setScore(Number(savedScore));
            }
        } catch (e) { }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchHeroImages(), fetchAllData(), fetchExpressways(), fetchScore()]);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        if (heroImages.length <= 1) return;

        const timer = setInterval(() => {
            setActiveSlideIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % heroImages.length;

                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });

                return nextIndex;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, [heroImages]);

    const onRefresh = () => {
        setRefreshing(true);
        loadAll();
    };

    const totalLength = statsData?.totalSystemLength ? statsData.totalSystemLength.toFixed(1) : '0.0';
    const completedSections = statsData?.totalSectionsCompleted || 0;
    const totalSections = statsData?.totalSections || 1;
    const operationalRate = ((completedSections / totalSections) * 100).toFixed(1);

    return (
        <View style={styles.screenWrapper}>
            <Header />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00a859']} />}
            >
                {/* HERO SLIDER CONTAINER (.hero-text-section) */}
                <View style={styles.heroSection}>
                    <FlatList
                        ref={flatListRef}
                        data={heroImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        nestedScrollEnabled={true}
                        scrollEventThrottle={16}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        onMomentumScrollEnd={(e) => {
                            const slide = Math.round(e.nativeEvent.contentOffset.x / width);
                            if (slide !== activeSlideIndex && slide >= 0 && slide < heroImages.length) {
                                setActiveSlideIndex(slide);
                            }
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.heroSlideWrapper}>
                                <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
                            </View>
                        )}
                    />

                    {/* Mask Overlay (.hero-overlay) */}
                    <View style={styles.heroOverlay} pointerEvents="none" />

                    {/* Hero Content */}
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{t('home.title1')}</Text>
                        <Text style={styles.heroTitleEmerald}>{t('home.title2')}</Text>
                        <Text style={styles.heroDesc}>{t('home.text1')}</Text>

                        <View style={styles.heroBtnsGroup}>
                            <TouchableOpacity
                                style={styles.btnEmerald}
                                onPress={() => navigation.navigate('MapScreen')}
                                activeOpacity={0.8}
                            >
                                <FontAwesome5 name="compass" size={14} color="#FFFFFF" />
                                <Text style={styles.btnEmeraldText}>{t('home.mapAccess')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnLearnMore}
                                onPress={() => navigation.navigate('MapScreen')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnLearnMoreText}>{t('home.learnMore')}</Text>
                                <FontAwesome5 name="arrow-right" size={12} color="#00a859" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dots Indicator (Giống slick-dots trên web) */}
                    <View style={styles.dotsContainer}>
                        {heroImages.map((_, idx) => (
                            <View
                                key={idx}
                                style={[styles.dot, activeSlideIndex === idx ? styles.activeDot : styles.inactiveDot]}
                            />
                        ))}
                    </View>
                </View>

                {/* THỐNG KÊ CARDS (.stats-cards-section) */}
                <View style={styles.statsCardsSection}>
                    {/* Card 1: Tổng chiều dài */}
                    <View style={styles.statCard}>
                        <View style={styles.statInfoContainer}>
                            <Text style={styles.statTitle}>{t('home.totalLength')}</Text>
                            <Text style={styles.statValue}>
                                {totalLength} <Text style={styles.statUnit}>Km</Text>
                            </Text>
                        </View>
                        <View style={styles.statIconBadge}>
                            <MaterialCommunityIcons name="speedometer" size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Card 2: Tiến độ Vận hành */}
                    <View style={styles.statCard}>
                        <View style={styles.statInfoContainer}>
                            <Text style={styles.statTitle}>{t('home.progress')}</Text>
                            <Text style={styles.statValue}>
                                {operationalRate} <Text style={styles.statUnit}>%</Text>
                            </Text>
                        </View>
                        <View style={styles.statIconBadge}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Card 3: Hạ tầng An toàn */}
                    <View style={styles.statCard}>
                        <View style={styles.statInfoContainer}>
                            <Text style={styles.statTitle}>{t('home.infrastructure')}</Text>
                            <Text style={styles.statValue}>
                                {score} <Text style={styles.statUnit}>{t('home.score')}</Text>
                            </Text>
                        </View>
                        <View style={styles.statIconBadge}>
                            <MaterialIcons name="grid-view" size={20} color="#FFFFFF" />
                        </View>
                    </View>
                </View>

                {/* BẢNG BẢO TRÌ & SỰ CỐ (.tables-status-section) */}
                <View style={styles.tablesStatusSection}>
                    {/* 1. Sự cố */}
                    <View style={styles.tableCard}>
                        <View style={styles.tableHeaderRow}>
                            <FontAwesome5 name="exclamation-triangle" size={15} color="#FF4D4F" />
                            <Text style={[styles.tableTitle, { color: '#FF4D4F' }]}>
                                {t('home.incident')} ({incidents.length})
                            </Text>
                        </View>
                        {incidents.length === 0 ? (
                            <Text style={styles.emptyText}>No Incident Expressway</Text>
                        ) : (
                            incidents.map((item: any, idx: number) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.colName}>{item.NameSection || 'N/A'}</Text>
                                    <Text style={styles.colRoute}>
                                        {item.StartLocation || 'N/A'} &rarr; {item.EndLocation || 'N/A'}
                                    </Text>
                                    <Text style={styles.colLength}>{item.Length ? `${item.Length} km` : '-'}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    {/* 2. Bảo trì */}
                    <View style={styles.tableCard}>
                        <View style={styles.tableHeaderRow}>
                            <FontAwesome5 name="tools" size={15} color="#722ED1" />
                            <Text style={[styles.tableTitle, { color: '#722ED1' }]}>
                                {t('home.maintenance')} ({maintenances.length})
                            </Text>
                        </View>
                        {maintenances.length === 0 ? (
                            <Text style={styles.emptyText}>No Maintenance Expressway</Text>
                        ) : (
                            maintenances.map((item: any, idx: number) => (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={styles.colName}>{item.NameSection || 'N/A'}</Text>
                                    <Text style={styles.colRoute}>
                                        {item.StartLocation || 'N/A'} &rarr; {item.EndLocation || 'N/A'}
                                    </Text>
                                    <Text style={styles.colLength}>{item.Length ? `${item.Length} km` : '-'}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* DANH SÁCH BẢN ĐỒ CAO TỐC (.gis-preview-section) */}
                <View style={styles.gisPreviewSection}>
                    <Text style={styles.sectionHeaderTitle}>{t('home.mapSystem')}</Text>
                    <View style={{ marginTop: 16 }}>
                        {routesData.map((item: any) => {
                            const isActive = activeRouteId === item.ExpresswayId;
                            return (
                                <TouchableOpacity
                                    key={item.ExpresswayId}
                                    style={[styles.routeListItem, isActive && styles.routeListItemActive]}
                                    onPress={() => setActiveRouteId(item.ExpresswayId)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.routeHeaderRow}>
                                        <Text style={[styles.routeItemTitle, isActive && styles.routeItemTitleActive]}>
                                            {item.NameExpressway}
                                        </Text>
                                        {item.Symbol && (
                                            <View style={[styles.symbolBadge, isActive && styles.symbolBadgeActive]}>
                                                <Text style={styles.symbolBadgeText}>{item.Symbol}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.routeItemDesc} numberOfLines={2}>
                                        {item.Description ||
                                            (item.section && item.section.length > 0
                                                ? `Gồm ${item.section.length} phân đoạn tuyến`
                                                : 'Tuyến đường cao tốc quốc gia')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.mapHolder}>
                        <MapHome
                            isFullscreen={isFullscreen}
                            setIsFullscreen={setIsFullscreen}
                            mapDataFromApi={selectedExpressway?.MapData}
                        />

                        {!isFullscreen && (
                            <TouchableOpacity
                                style={styles.fullScreenLink}
                                onPress={() => setIsFullscreen(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.fullScreenLinkText}>{t('home.fullScreen')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 80,
    },

    heroSection: {
        position: 'relative',
        width: width,
        height: 320,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSlideWrapper: {
        width: width,
        height: 320,
    },
    heroImage: {
        width: width,
        height: 320,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    heroContent: {
        position: 'absolute',
        zIndex: 3,
        paddingHorizontal: 20,
        alignItems: 'center',
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    heroTitleEmerald: {
        fontSize: 22,
        fontWeight: '800',
        color: '#00A859',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroDesc: {
        fontSize: 13,
        color: '#E6EFFD',
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 320,
    },
    heroBtnsGroup: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    btnEmerald: {
        backgroundColor: '#00A859',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    btnEmeraldText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    btnLearnMore: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#00A859',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    btnLearnMoreText: {
        color: '#00A859',
        fontWeight: 'bold',
        fontSize: 14,
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 15,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        zIndex: 4,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#00A859',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },

    // STATS SECTION (.stats-cards-section)
    statsCardsSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        gap: 12,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00A859',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: 'rgba(0, 168, 89, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
    },
    statInfoContainer: {
        flex: 1,
    },
    statTitle: {
        color: '#00A859',
        fontSize: 13,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00A859',
        marginTop: 4,
    },
    statUnit: {
        fontSize: 13,
        fontWeight: 'normal',
        color: '#64748B',
    },
    statIconBadge: {
        backgroundColor: '#00A859',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // TABLES STATUS SECTION (.tables-status-section)
    tablesStatusSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 16,
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
        elevation: 2,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 8,
    },
    tableTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F1F5F9',
    },
    colName: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#334155',
        flex: 1,
    },
    colRoute: {
        fontSize: 12,
        color: '#64748B',
        flex: 1.2,
        textAlign: 'center',
    },
    colLength: {
        fontSize: 12,
        color: '#0F172A',
        fontWeight: '600',
    },

    // GIS PREVIEW (.gis-preview-section)
    gisPreviewSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 16,
    },
    routeListItem: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 4,
        borderLeftColor: 'transparent',
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },
    routeListItemActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#00A859',
        borderLeftColor: '#00A859',
        elevation: 3,
    },
    routeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    routeItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#262626',
        flex: 1,
    },
    routeItemTitleActive: {
        color: '#0A9646',
    },
    symbolBadge: {
        backgroundColor: '#52C41A',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    symbolBadgeActive: {
        backgroundColor: '#0A9646',
    },
    symbolBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    routeItemDesc: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    mapHolder: {
        marginBottom: 8,
    },
    fullScreenLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        marginTop: 6,
    },
    fullScreenLinkText: {
        color: '#00A859',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
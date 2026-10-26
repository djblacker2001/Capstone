import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import axiosClient from '../api/axiosClient';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

interface Sign {
    SignId: number;
    Symbol: string;
    Image?: string | null;
    Description?: string | null;
    signType?: {
        SignTypeId: number;
        NameSignType: string;
    };
}

export default function SignScreen() {
    const navigation = useNavigation<any>();

    const handleOpenDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const { t } = useTranslation();
    const [signs, setSigns] = useState<Sign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedTypeId, setSelectedTypeId] = useState<string>('All');
    const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

    const filterOptions = [
        { id: 'All', label: t('sign.allSigns', 'Tất cả') },
        { id: '1', label: t('sign.prohibitionSigns', 'Biển cấm') },
        { id: '2', label: t('sign.hazardSigns', 'Biển nguy hiểm') },
        { id: '3', label: t('sign.commandSigns', 'Biển hiệu lệnh') },
        { id: '4', label: t('sign.signposts', 'Biển chỉ dẫn') },
        { id: '5', label: t('sign.expresswaySigns', 'Biển cao tốc') },
        { id: '6', label: t('sign.supplementarySigns', 'Biển phụ') },
    ];
    const fetchSigns = async (typeId: string) => {
        setLoading(true);
        try {
            const url = typeId === 'All' ? '/signs' : `/signs/type/${typeId}`;
            const res = await axiosClient.get(url);
            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.data || res.data?.result || [];

            setSigns(data);
        } catch (err) {
            console.error('Lỗi lấy danh sách biển báo:', err);
            setSigns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSigns(selectedTypeId);
    }, [selectedTypeId]);

    const getFullImageUrl = (imagePath?: string | null) => {
        if (!imagePath) return 'https://placehold.co/150?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${baseUrl}/${imagePath}`;
    };

    const getSignTypeName = (sign: Sign): string => {
        if (sign.signType?.NameSignType) {
            return sign.signType.NameSignType;
        }
        if (!sign.Symbol) return 'Khác';
        const upper = sign.Symbol.toUpperCase();
        if (upper.startsWith('P')) return 'Biển báo cấm';
        if (upper.startsWith('W')) return 'Biển nguy hiểm và cảnh báo';
        if (upper.startsWith('R')) return 'Biển hiệu lệnh';
        if (upper.startsWith('I')) return 'Biển chỉ dẫn';
        if (upper.startsWith('S')) return 'Biển phụ';
        return 'Biển báo khác';
    };

    const getTagColor = (typeId?: number) => {
        switch (typeId) {
            case 1:
                return { bg: '#FEE2E2', text: '#DC2626' }; // Red
            case 2:
                return { bg: '#FFEDD5', text: '#EA580C' }; // Orange
            case 3:
                return { bg: '#DBEAFE', text: '#2563EB' }; // Blue
            case 4:
                return { bg: '#CFFAFE', text: '#0891B2' }; // Cyan
            case 5:
                return { bg: '#DCFCE7', text: '#16A34A' }; // Green
            case 6:
                return { bg: '#F3E8FF', text: '#9333EA' }; // Purple
            default:
                return { bg: '#F3F4F6', text: '#4B5563' };
        }
    };

    // Lọc và sắp xếp danh sách biển báo
    const filteredAndSortedSigns = useMemo(() => {
        return signs
            .filter((sign) => {
                const symbolMatch = sign.Symbol?.toLowerCase().includes(searchText.toLowerCase());
                const descMatch = sign.Description?.toLowerCase().includes(searchText.toLowerCase());
                return symbolMatch || descMatch;
            })
            .sort((a, b) => {
                const nameA = getSignTypeName(a) || '';
                const nameB = getSignTypeName(b) || '';
                const typeComparison = nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
                if (typeComparison !== 0) return typeComparison;

                const symbolA = a.Symbol || '';
                const symbolB = b.Symbol || '';
                return symbolA.localeCompare(symbolB, 'vi', { numeric: true, sensitivity: 'base' });
            });
    }, [signs, searchText]);

    const renderSignItem = ({ item }: { item: Sign }) => {
        const isImageFailed = failedImages[item.SignId];
        const imageUrl = isImageFailed ? 'https://placehold.co/150?text=No+Image' : getFullImageUrl(item.Image);
        const typeName = getSignTypeName(item);
        const tagStyle = getTagColor(item.signType?.SignTypeId);
        return (
            <View style={styles.card}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.signImage}
                        resizeMode="contain"
                        onError={() => {
                            setFailedImages((prev) => ({ ...prev, [item.SignId]: true }));
                        }}
                    />
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
                            <Text style={[styles.tagText, { color: tagStyle.text }]}>{item.Symbol}</Text>
                        </View>
                        <View style={styles.subTag}>
                            <Text style={styles.subTagText} numberOfLines={1}>
                                {typeName}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.description} numberOfLines={3}>
                        {item.Description || 'Chưa có thông tin mô tả.'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                userName="admin1"
                avatarUrl="https://i.pravatar.cc/150?img=12"
                onOpenDrawer={handleOpenDrawer}
            />
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{t('sign.title', 'HỆ THỐNG BIỂN BÁO')}</Text>
                    <Text style={styles.subtitle}>{t('sign.text', 'Tra cứu thông tin biển báo giao thông cao tốc')}</Text>
                </View>

                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('sign.search', 'Tìm theo mã biển báo hoặc nội dung...')}
                        placeholderTextColor="#94A3B8"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.filterWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        {filterOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.chip, selectedTypeId === opt.id && styles.chipActive]}
                                onPress={() => setSelectedTypeId(opt.id)}
                            >
                                <Text style={[styles.chipText, selectedTypeId === opt.id && styles.chipTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#008744" />
                        <Text style={styles.loadingText}>Đang tải danh sách biển báo...</Text>
                    </View>
                ) : filteredAndSortedSigns.length > 0 ? (
                    <FlatList
                        data={filteredAndSortedSigns}
                        keyExtractor={(item) => item.SignId.toString()}
                        renderItem={renderSignItem}
                        numColumns={2}
                        columnWrapperStyle={styles.rowWrapper}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#CBD5E0" />
                        <Text style={styles.emptyText}>Không tìm thấy biển báo nào khớp với yêu cầu.</Text>
                    </View>
                )}
            </View>
            <Footer />
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
    titleContainer: {
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1E293B',
    },
    filterWrapper: {
        maxHeight: 40,
        marginBottom: 12,
    },
    filterContainer: {
        gap: 8,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipActive: {
        backgroundColor: '#008744',
        borderColor: '#008744',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#475569',
    },
    chipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    listContainer: {
        paddingBottom: 16,
    },
    rowWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    imageWrapper: {
        height: 120,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    signImage: {
        width: '100%',
        height: '100%',
    },
    cardBody: {
        padding: 10,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    subTag: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        flexShrink: 1,
    },
    subTagText: {
        fontSize: 10,
        color: '#64748B',
    },
    description: {
        fontSize: 12,
        color: '#334155',
        lineHeight: 17,
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
});
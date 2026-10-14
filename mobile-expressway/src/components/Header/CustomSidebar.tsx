import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, } from '@react-navigation/drawer';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export const CustomSidebar = (props: any) => {
    const [currentLang, setCurrentLang] = useState<'VIE' | 'ENG'>('VIE');

    const toggleLanguage = () => {
        setCurrentLang((prev) => (prev === 'VIE' ? 'ENG' : 'VIE'));
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                <View style={styles.imageBannerContainer}>
                    <Image
                        source={{
                            uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
                        }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                    <Text style={styles.bannerTitle}>HỆ THỐNG CAO TỐC</Text>
                    <Text style={styles.bannerSubtitle}>Quản lý & Cảnh báo giao thông</Text>
                </View>
                <View style={styles.langSection}>
                    <Text style={styles.sectionLabel}>Ngôn ngữ / Language</Text>
                    <TouchableOpacity
                        style={styles.langToggleBtn}
                        onPress={toggleLanguage}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="language" size={20} color="#008744" />
                        <Text style={styles.langToggleText}>
                            {currentLang === 'VIE' ? 'Tiếng Việt (VIE)' : 'English (ENG)'}
                        </Text>
                        <MaterialIcons name="swap-horiz" size={20} color="#008744" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialIcons name="map" size={22} color="#333333" />
                        <Text style={styles.menuItemText}>Bản đồ cao tốc</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialIcons name="alt-route" size={22} color="#333333" />
                        <Text style={styles.menuItemText}>Tra cứu phân đoạn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialIcons name="warning" size={22} color="#333333" />
                        <Text style={styles.menuItemText}>Cảnh báo sự cố</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialIcons name="settings" size={22} color="#333333" />
                        <Text style={styles.menuItemText}>Cài đặt ứng dụng</Text>
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>

            {/* Nút Đăng xuất ở chân Sidebar */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={20} color="#FF4D4F" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    imageBannerContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
        justifyContent: 'flex-end',
        padding: 16,
    },
    bannerImage: {
        ...StyleSheet.absoluteFill,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.45)', // Phủ lớp xám để chữ nổi bật
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerSubtitle: {
        color: '#E0E0E0',
        fontSize: 12,
        marginTop: 2,
    },
    langSection: {
        padding: 16,
        backgroundColor: '#F9F9F9',
    },
    sectionLabel: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 8,
        fontWeight: '500',
    },
    langToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#008744',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    langToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#008744',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    menuList: {
        paddingVertical: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 16,
    },
    menuItemText: {
        fontSize: 15,
        color: '#333333',
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoutText: {
        color: '#FF4D4F',
        fontSize: 15,
        fontWeight: '600',
    },
});
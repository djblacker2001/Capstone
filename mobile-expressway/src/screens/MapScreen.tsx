import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';

import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
    const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
    const [currentSpeed, setCurrentSpeed] = useState<number>(85);
    const [speedLimit, setSpeedLimit] = useState<number>(100);

    const [activeAlert, setActiveAlert] = useState({
        type: 'incident', // 'incident' | 'maintenance'
        title: 'Cảnh báo sự cố phía trước',
        location: 'Km 45+200 (Hướng Hà Nội - Hải Phòng)',
        message: 'Có vụ va chạm nhẹ, các phương tiện chú ý giảm tốc độ.',
        distance: '800m',
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 1. KHU VỰC BẢN ĐỒ LÀM NỀN (MAP CONTAINER) */}
            <View style={styles.mapContainer}>
                {/*
          THỰC TẾ: Thay thế View này bằng <MapView /> của 'react-native-maps' hoặc Mapbox
          <MapView style={styles.map} initialRegion={...} />
        */}
                <View style={styles.mapPlaceholder}>
                    <MaterialCommunityIcons name="map-legend" size={64} color="#a0aec0" />
                    <Text style={styles.mapPlaceholderText}>
                        Bản đồ GIS Dẫn đường & GPS Real-time
                    </Text>
                </View>

                {/* 2. THANH TÌM KIẾM TRÊN BẢN ĐỒ (SEARCH BAR) */}
                <View style={styles.searchOverlay}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Tìm kiếm cao tốc, nút giao, trạm dừng..."
                            placeholderTextColor="#8c8c8c"
                            style={styles.searchInput}
                        />
                        <TouchableOpacity style={styles.micButton}>
                            <Ionicons name="mic" size={20} color="#00a859" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. ĐỒNG HỒ TỐC ĐỘ & CÔNG TẮC GIỌNG NÓI (HUD SPEEDOMETER) */}
                <View style={styles.hudContainer}>
                    {/* Giới hạn tốc độ */}
                    <View style={styles.speedLimitCircle}>
                        <Text style={styles.speedLimitText}>{speedLimit}</Text>
                    </View>

                    {/* Tốc độ hiện tại */}
                    <View style={styles.currentSpeedBox}>
                        <Text style={styles.currentSpeedText}>{currentSpeed}</Text>
                        <Text style={styles.speedUnitText}>km/h</Text>
                    </View>

                    {/* Nút bật/tắt cảnh báo giọng nói */}
                    <TouchableOpacity
                        style={[
                            styles.voiceToggleButton,
                            { backgroundColor: isVoiceActive ? '#00a859' : '#8c8c8c' },
                        ]}
                        onPress={() => setIsVoiceActive(!isVoiceActive)}
                    >
                        <Ionicons
                            name={isVoiceActive ? 'volume-high' : 'volume-mute'}
                            size={22}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                </View>

                {/* 4. THẺ CẢNH BÁO NỔI (FLOATING ALERT CARD) */}
                {activeAlert && (
                    <View style={styles.alertCardOverlay}>
                        <View
                            style={[
                                styles.alertCard,
                                {
                                    borderLeftColor:
                                        activeAlert.type === 'incident' ? '#ff4d4f' : '#722ed1',
                                },
                            ]}
                        >
                            <View style={styles.alertHeader}>
                                <View style={styles.alertTitleGroup}>
                                    <Ionicons
                                        name={
                                            activeAlert.type === 'incident'
                                                ? 'warning'
                                                : 'construct'
                                        }
                                        size={20}
                                        color={
                                            activeAlert.type === 'incident' ? '#ff4d4f' : '#722ed1'
                                        }
                                    />
                                    <Text style={styles.alertTitle}>{activeAlert.title}</Text>
                                </View>
                                <Text style={styles.alertDistance}>{activeAlert.distance}</Text>
                            </View>

                            <Text style={styles.alertLocation}>{activeAlert.location}</Text>
                            <Text style={styles.alertMessage}>{activeAlert.message}</Text>
                        </View>
                    </View>
                )}

                {/* 5. CÁC NÚT TÁC VỤ NHANH (QUICK ACTION BUTTONS) */}
                <View style={styles.quickActionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <FontAwesome5 name="coffee" size={14} color="#00a859" />
                            <Text style={styles.quickActionText}>Trạm dừng nghỉ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionButton}>
                            <MaterialCommunityIcons
                                name="routes"
                                size={16}
                                color="#00a859"
                            />
                            <Text style={styles.quickActionText}>Nút giao</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionButton}>
                            <MaterialCommunityIcons
                                name="gas-station"
                                size={16}
                                color="#00a859"
                            />
                            <Text style={styles.quickActionText}>Cây xăng</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionButton}>
                            <Ionicons name="call" size={14} color="#00a859" />
                            <Text style={styles.quickActionText}>Cứu hộ cao tốc</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eef2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        marginTop: 12,
        color: '#718096',
        fontWeight: '500',
        fontSize: 14,
    },
    searchOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#262626',
    },
    micButton: {
        padding: 6,
    },
    hudContainer: {
        position: 'absolute',
        top: 80,
        right: 16,
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
    },
    speedLimitCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: '#ff4d4f',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    speedLimitText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    currentSpeedBox: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    currentSpeedText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#00a859',
    },
    speedUnitText: {
        fontSize: 10,
        color: '#8c8c8c',
        marginTop: -4,
    },
    voiceToggleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    alertCardOverlay: {
        position: 'absolute',
        bottom: 70,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    alertCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#262626',
    },
    alertDistance: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ff4d4f',
        backgroundColor: '#fff1f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    alertLocation: {
        fontSize: 12,
        fontWeight: '600',
        color: '#595959',
        marginTop: 4,
    },
    alertMessage: {
        fontSize: 12,
        color: '#8c8c8c',
        marginTop: 2,
    },
    quickActionsContainer: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        right: 0,
        zIndex: 10,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        gap: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#262626',
    },
});
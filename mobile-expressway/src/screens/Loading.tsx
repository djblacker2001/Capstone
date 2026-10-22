import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';

interface LoadingProps {
    onFinish?: () => void;
    navigation?: any;
}

export default function Loading({ onFinish, navigation }: LoadingProps) {
    const [statusText, setStatusText] = useState('Đang khởi tạo hệ thống...');
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
        const initApp = async () => {
            try {
                setStatusText('Kiểm tra tín hiệu GPS & Kết nối...');
                await new Promise((res) => setTimeout(res, 800));
                setStatusText('Tải dữ liệu hạ tầng cao tốc...');
                await new Promise((res) => setTimeout(res, 800));
                setStatusText('Sẵn sàng!');
                await new Promise((res) => setTimeout(res, 400));
                if (onFinish) {
                    onFinish();
                } else if (navigation) {
                    navigation.replace('HomeDrawer');
                }
            } catch (error) {
                setStatusText('Có lỗi xảy ra khi khởi động!');
            }
        };

        initApp();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                <Image
                    source={require('../../assets/expresswayicon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>EXPRESSWAY SAFETY</Text>
                <Text style={styles.subtitle}>Hệ Thống Giám Sát & Cảnh Báo Cao Tốc</Text>
            </Animated.View>

            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00a859" />
                <Text style={styles.statusText}>{statusText}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003366',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    logo: {
        width: 110,
        height: 110,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 1.2,
    },
    subtitle: {
        fontSize: 13,
        color: '#b0c4de',
        marginTop: 6,
    },
    loadingContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statusText: {
        marginTop: 15,
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '500',
    },
});
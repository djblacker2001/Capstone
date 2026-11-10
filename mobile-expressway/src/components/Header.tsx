import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

interface HeaderProps {
    onOpenDrawer?: () => void;
    userName?: string;
    avatarUrl?: string;
}

export default function Header({
    onOpenDrawer,
    userName: propUserName,
    avatarUrl: propAvatarUrl,
}: HeaderProps) {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Lỗi đọc thông tin user từ storage:', error);
                setIsLoggedIn(false);
            }
        };

        if (isFocused) {
            loadUserInfo();
        }
    }, [isFocused]);

    const apiUserName = user?.Username || user?.username || user?.name;
    const displayName = propUserName || apiUserName;
    const rawAvatar = propAvatarUrl || user?.Avatar || user?.avatar;

    const displayAvatar = rawAvatar
        ? rawAvatar.startsWith('http')
            ? rawAvatar
            : rawAvatar.includes('uploads/avatars')
                ? `${baseUrl}/${rawAvatar.replace(/^\/+/, '')}`
                : `${baseUrl}/uploads/avatars/${rawAvatar}`
        : null;

    const handlePressProfile = () => {
        navigation.navigate('ProfileScreen');
    };

    const handlePressLogin = () => {
        navigation.navigate('Login');
    };

    const handlePressMenu = () => {
        if (onOpenDrawer) {
            onOpenDrawer();
            return;
        }

        if (typeof navigation.openDrawer === 'function') {
            navigation.openDrawer();
            return;
        }

        const parentNavigation = navigation.getParent();
        if (parentNavigation && typeof parentNavigation.openDrawer === 'function') {
            parentNavigation.openDrawer();
            return;
        }

        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Góc trái: Menu Button + Logo */}
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={handlePressMenu}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="menu" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/expresswayicon.png')}
                            style={styles.logoIcon}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Góc phải: Đổi linh hoạt giữa User Profile và Nút Đăng Nhập */}
                <View style={styles.rightContainer}>
                    {isLoggedIn ? (
                        <TouchableOpacity
                            style={styles.userContainer}
                            onPress={handlePressProfile}
                            activeOpacity={0.7}
                        >
                            {displayAvatar ? (
                                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.defaultAvatar}>
                                    <FontAwesome5 name="user" size={14} color="#555555" />
                                </View>
                            )}
                            <Text style={styles.userName} numberOfLines={1}>
                                {displayName || 'User'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handlePressLogin}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="login" size={18} color="#008744" />
                            <Text style={styles.loginButtonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#008744',
    },
    container: {
        height: 60,
        backgroundColor: '#008744',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuButton: {
        width: 38,
        height: 38,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        width: 28,
        height: 28,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    defaultAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    loginButtonText: {
        color: '#008744',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
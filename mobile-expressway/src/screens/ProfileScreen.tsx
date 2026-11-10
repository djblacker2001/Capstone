import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

import Header from '../components/Header';
import Footer from '../components/Footer';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchUserProfile = async () => {
        try {
            const savedUserStr = await AsyncStorage.getItem('user');
            const token = (await AsyncStorage.getItem('accessToken')) || (await AsyncStorage.getItem('token'));

            if (!savedUserStr || !token) {
                await handleLogout();
                return;
            }

            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);

            try {
                const res = await axiosClient.get('/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const freshUser = res.data?.data || res.data;

                if (freshUser) {
                    const mergedUser = {
                        ...savedUser,
                        ...freshUser,
                        RoleId: savedUser.RoleId ?? freshUser.RoleId,
                    };
                    await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
                    setUser(mergedUser);
                }
            } catch (apiError: any) {
                console.warn('Không thể làm mới profile từ API, dùng dữ liệu local:', apiError?.message);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin người dùng:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['user', 'accessToken', 'token', 'access_token']);
        setUser(null);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserProfile();
    };

    if (loading && !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#008744" />
                <Text style={styles.loadingText}>Đang xác thực tài khoản...</Text>
            </View>
        );
    }

    if (!user) return null;

    const username = user.Username || user.username || 'N/A';
    const email = user.Email || user.email || 'N/A';
    const roleId = Number(user.RoleId ?? user.roleId);
    const roleName = user.Role || user.role || (roleId === 1 ? 'Administrator' : 'User');
    const avatarPath = user.Avatar || user.avatar;

    const avatarSrc = avatarPath
        ? avatarPath.startsWith('http')
            ? avatarPath
            : avatarPath.includes('uploads/avatars')
                ? `${baseUrl}/${avatarPath}`
                : `${baseUrl}/uploads/avatars/${avatarPath}`
        : null;

    return (
        <View style={styles.screenWrapper}>
            <Header />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008744']} />}
            >
                <View style={styles.profileCard}>
                    <Text style={styles.title}>Personal Profile</Text>

                    <View style={styles.avatarWrapper}>
                        {avatarSrc ? (
                            <Image source={{ uri: avatarSrc }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <FontAwesome5 name="user" size={50} color="#94A3B8" />
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="user" size={16} color="#94A3B8" style={styles.inputIcon} />
                            <Text style={styles.inputValue}>{username}</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={18} color="#94A3B8" style={styles.inputIcon} />
                            <Text style={styles.inputValue}>{email}</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="verified-user" size={18} color="#10B981" style={styles.inputIcon} />
                            <Text style={[styles.inputValue, styles.roleValue]}>{roleName}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('SettingScreen')}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="edit" size={20} color="#008744" />
                        <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#008744',
        fontWeight: '500',
    },
    profileCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 20,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputValue: {
        fontSize: 15,
        color: '#334155',
        flex: 1,
    },
    roleValue: {
        fontWeight: 'bold',
        color: '#059669',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 10,
        height: 48,
        marginTop: 16,
        gap: 8,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#008744',
        borderRadius: 10,
        height: 48,
        marginTop: 16,
        gap: 8,
    },
    editBtnText: {
        color: '#008744',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
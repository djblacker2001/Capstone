import React from 'react';
import {View,Text,StyleSheet,Image,TouchableOpacity,ScrollView,} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomSidebar(props: DrawerContentComponentProps) {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.logoRow}>
                    <Ionicons name="car-sport" size={28} color="#E0A96D" />
                    <Text style={styles.logoText}>EXPRESSWAY</Text>
                </View>
            </View>

            {/* 2. Banner Image */}
            <Image
                source={{
                    uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop',
                }}
                style={styles.bannerImage}
                resizeMode="cover"
            />

            {/* 3. Danh sách Menu Items */}
            <ScrollView contentContainerStyle={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('HomeScreen')}>
                    <Ionicons name="home-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>Trang chủ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('NavigationScreen')}>
                    <Ionicons name="language-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>Ngôn ngữ (Language)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="chatbox-ellipses-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>Liên hệ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="information-circle-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>Thông tin hệ thống</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={async () => {
                        // 1. Xóa token và thông tin người dùng
                        await AsyncStorage.multiRemove(['accessToken', 'token', 'user']);

                        // 2. Reset navigation về Login
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            })
                        );
                    }}>
                    <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
                    <Text style={[styles.menuText, { color: '#E53E3E' }]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF3FA',
    },
    headerContainer: {
        backgroundColor: '#0F3B66',
        paddingVertical: 18,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoText: {
        color: '#E0A96D',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    bannerImage: {
        width: '100%',
        height: 140,
    },
    menuContainer: {
        paddingTop: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 16,
    },
    menuText: {
        fontSize: 15,
        color: '#2D3748',
        fontWeight: '500',
    },
    footerContainer: {
        borderTopWidth: 1,
        borderTopColor: '#CBD5E0',
        paddingBottom: 10,
    },
    logoutButton: {
        marginTop: 6,
    },
});
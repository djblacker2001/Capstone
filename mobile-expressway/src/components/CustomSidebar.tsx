import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n, { changeAppLanguage } from '../i18n/i18n';

export default function CustomSidebar(props: DrawerContentComponentProps) {
    const { t } = useTranslation();
    const handleToggleLanguage = () => {
        const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
        changeAppLanguage(nextLang);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerWrapper}>
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    <View style={styles.logoRow}>
                        <Ionicons name="car-sport" size={28} color="#E0A96D" />
                        <Text style={styles.logoText}>{t('sidebar.expressway')}</Text>
                    </View>
                </SafeAreaView>
            </View>

            <Image
                source={{
                    uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop',
                }}
                style={styles.bannerImage}
                resizeMode="cover"
            />

            <ScrollView contentContainerStyle={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => props.navigation.navigate('HomeScreen')}
                >
                    <Ionicons name="home-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>{t('sidebar.homepage')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleToggleLanguage}
                >
                    <Ionicons name="language-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>
                        {t('sidebar.language')} ({i18n.language === 'vi' ? 'VI 🇻🇳' : 'EN 🇬🇧'})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="chatbox-ellipses-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>{t('sidebar.contact')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="information-circle-outline" size={22} color="#1A365D" />
                    <Text style={styles.menuText}>{t('sidebar.system_info')}</Text>
                </TouchableOpacity>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutButton]}
                    onPress={async () => {
                        await AsyncStorage.multiRemove(['accessToken', 'token', 'user']);
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            })
                        );
                    }}>
                    <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
                    <Text style={[styles.menuText, { color: '#E53E3E' }]}>{t('sidebar.logout')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF3FA',
    },
    headerWrapper: {
        backgroundColor: '#008744',
    },
    headerSafeArea: {
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
        backgroundColor: '#EBF3FA',
    },
    logoutButton: {
        paddingVertical: 12,
    },
});
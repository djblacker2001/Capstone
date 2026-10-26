import React from 'react';
import { View, StyleSheet, StatusBar, Text, ScrollView } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function HomeScreen() {
    const navigation = useNavigation<any>();

    const handleOpenDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <View style={styles.container}>
            <Header
                userName="admin1"
                avatarUrl="https://i.pravatar.cc/150?img=12"
                onOpenDrawer={handleOpenDrawer}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.welcomeText}>Hệ thống Giám sát Cao tốc</Text>

                <View style={styles.cardContainer}>
                    <View style={[styles.card, { backgroundColor: '#008744' }]}>
                        <Text style={styles.cardTitle}>Tuyến đường</Text>
                        <Text style={styles.cardValue}>12 Cao tốc</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: '#D97706' }]}>
                        <Text style={styles.cardTitle}>Đang bảo trì</Text>
                        <Text style={styles.cardValue}>3 Đoạn</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: '#DC2626' }]}>
                        <Text style={styles.cardTitle}>Sự cố giao thông</Text>
                        <Text style={styles.cardValue}>1 Cảnh báo</Text>
                    </View>
                </View>
            </ScrollView>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 16,
    },
    cardContainer: {
        gap: 12,
    },
    card: {
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.9,
    },
    cardValue: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 6,
    },
});
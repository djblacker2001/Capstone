import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function ProfileScreen() {
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
            <View style={styles.content}>
                <Text style={styles.text}>Thông tin cá nhân</Text>
            </View>

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
        flex: 1, // 👈 ĐÂY LÀ DÒNG QUYẾT ĐỊNH: Giãn ra hết khoảng trống giữa Header và Footer
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: '#2D3748',
        fontWeight: '600',
    },
});
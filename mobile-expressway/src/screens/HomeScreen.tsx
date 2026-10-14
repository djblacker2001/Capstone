import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header/Header';

export default function HomeScreen() {
    const navigation = useNavigation();

    const handleOpenDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <View style={styles.container}>
            <Header
                userName="admin1"
                avatarUrl="https://via.placeholder.com/150"
                onOpenDrawer={handleOpenDrawer} // Gọi hàm vừa tạo
            />

            <View style={styles.content}>
                {/* Nội dung bản đồ / chính ở đây */}
            </View>
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
    },
});
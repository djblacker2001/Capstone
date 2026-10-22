import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
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
            <StatusBar barStyle="light-content" backgroundColor="#008744" />

            <Header
                userName="admin1"
                avatarUrl="https://i.pravatar.cc/150?img=12"
                onOpenDrawer={handleOpenDrawer}
            />

            <View style={styles.content}>
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
        flex: 1,
        padding: 16,
    },
});
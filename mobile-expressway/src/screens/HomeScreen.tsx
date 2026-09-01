import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expressway Management System</Text>
            <Text style={styles.subtitle}>Hệ thống quản lý Đường cao tốc</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1677ff',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 8,
    },
});
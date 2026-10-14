import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform, } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface HeaderProps {
    onOpenDrawer?: () => void;
    userName?: string;
    avatarUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
    onOpenDrawer,
    userName = 'admin1',
    avatarUrl,
}) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={onOpenDrawer}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="menu" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <FontAwesome5 name="road" size={24} color="#000000" />
                    </View>
                </View>
                <View style={styles.rightContainer}>
                    <View style={styles.userContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.defaultAvatar}>
                                <FontAwesome5 name="user" size={14} color="#555555" />
                            </View>
                        )}
                        <Text style={styles.userName} numberOfLines={1}>
                            {userName}
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#008744',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
});
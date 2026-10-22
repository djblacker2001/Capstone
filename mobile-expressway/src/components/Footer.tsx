import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Footer: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const currentRoute = route.name;

    const navItems = [
        {
            id: 'HomeScreen',
            label: 'Trang chủ',
            type: 'ionicons',
            iconActive: 'home',
            iconInactive: 'home-outline',
        },
        {
            id: 'MapScreen',
            label: 'Bản đồ',
            type: 'ionicons',
            iconActive: 'map',
            iconInactive: 'map-outline',
        },
        {
            id: 'NavigationScreen',
            label: 'Tuyến đường',
            type: 'mci',
            iconActive: 'routes',
            iconInactive: 'routes-clock',
        },
        {
            id: 'DetailSectionScreen',
            label: 'Biển báo',
            type: 'mci',
            iconActive: 'sign-caution',
            iconInactive: 'sign-caution',
        },
        {
            id: 'ProfileScreen', // 👈 Mục Thông tin cá nhân mới thêm
            label: 'Cá nhân',
            type: 'fontawesome',
            iconActive: 'user-alt',
            iconInactive: 'user',
        },
    ];

    const handleNavigate = (screenName: string) => {
        if (currentRoute !== screenName) {
            navigation.navigate(screenName);
        }
    };

    const renderIcon = (item: typeof navItems[0], isActive: boolean, color: string) => {
        if (item.type === 'ionicons') {
            return (
                <Ionicons
                    name={(isActive ? item.iconActive : item.iconInactive) as any}
                    size={20}
                    color={color}
                />
            );
        }
        if (item.type === 'mci') {
            return (
                <MaterialCommunityIcons
                    name={(isActive ? item.iconActive : item.iconInactive) as any}
                    size={20}
                    color={color}
                />
            );
        }
        return (
            <FontAwesome5
                name={(isActive ? item.iconActive : item.iconInactive) as any}
                size={18}
                color={color}
            />
        );
    };

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <View style={styles.container}>
                {navItems.map((item) => {
                    const isActive = currentRoute === item.id;
                    const activeColor = '#008744';
                    const inactiveColor = '#718096';
                    const iconColor = isActive ? activeColor : inactiveColor;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.tabButton}
                            onPress={() => handleNavigate(item.id)}
                            activeOpacity={0.7}
                        >
                            {renderIcon(item, isActive, iconColor)}
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.tabLabel,
                                    { color: iconColor, fontWeight: isActive ? '700' : '500' },
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    container: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 3,
    },
});
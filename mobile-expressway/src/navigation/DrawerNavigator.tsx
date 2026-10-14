// src/navigation/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import { CustomSidebar } from '../components/Header/CustomSidebar';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomSidebar {...props} />}
            screenOptions={{
                headerShown: false, // Ẩn header mặc định
                drawerStyle: {
                    width: 280,
                },
            }}
        >
            <Drawer.Screen name="MainHome" component={HomeScreen} />
        </Drawer.Navigator>
    );
}
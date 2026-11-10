import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSidebar from '../components/CustomSidebar';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignScreen from '../screens/SignScreen';
import SectionScreen from '../screens/SectionScreen';
import DetailSectionScreen from '../screens/DetailSectionScreen';
import SettingScreen from '../screens/SettingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomSidebar {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: '100px',
                },
                overlayColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Drawer.Screen name="HomeDrawer" component={HomeScreen} />
            <Drawer.Screen name="MapScreen" component={MapScreen} />
            <Drawer.Screen name="SectionScreen" component={SectionScreen} />
            <Drawer.Screen name="DetailSectionScreen" component={DetailSectionScreen} />
            <Drawer.Screen name="SignScreen" component={SignScreen} />
            <Drawer.Screen name="LoginScreen" component={LoginScreen} />
            <Drawer.Screen name="RegisterScreen" component={RegisterScreen} />
            <Drawer.Screen name="SettingScreen" component={SettingScreen} />
            <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSidebar from '../components/CustomSidebar';
import HomeScreen from '../screens/HomeScreen';
import NavigationScreen from '../screens/NavigationScreen';
import MapScreen from '../screens/MapScreen';
import DetailSectionScreen from '../screens/DetailSectionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignScreen from '../screens/SignScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomSidebar {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: '75%',
                },
                overlayColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Drawer.Screen name="HomeScreen" component={HomeScreen} />
            <Drawer.Screen name="MapScreen" component={MapScreen} />
            <Drawer.Screen name="DetailSectionScreen" component={DetailSectionScreen} />
            <Drawer.Screen name="SignScreen" component={SignScreen} />
            <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
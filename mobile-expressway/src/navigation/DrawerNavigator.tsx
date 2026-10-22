import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomSidebar from '../components/CustomSidebar';
import HomeScreen from '../screens/HomeScreen';
import NavigationScreen from '../screens/NavigationScreen';
import MapScreen from '../screens/MapScreen';
import DetailSectionScreen from '../screens/DetailSectionScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomSidebar {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '78%',
                },
            }}>
            <Drawer.Screen name="HomeScreen" component={HomeScreen} />
            <Drawer.Screen name="MapScreen" component={MapScreen} />
            <Drawer.Screen name="NavigationScreen" component={NavigationScreen} />
            <Drawer.Screen name="DetailSectionScreen" component={DetailSectionScreen} />
            <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
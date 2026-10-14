// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator'; // Import Drawer vừa tạo
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// các screens khác...

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Màn hình Auth (nếu có) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* 2. Đổi HomeScreen thành DrawerNavigator */}
      <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
      
      {/* Các màn hình chi tiết khác (đi từ Home qua) */}
      {/* <Stack.Screen name="DetailSection" component={DetailSectionScreen} /> */}
    </Stack.Navigator>
  );
}
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingScreen from '../screens/Loading';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Loading" 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}
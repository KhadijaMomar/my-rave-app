import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import RaveScreen from '../screens/RaveScreen';

const Tab = createMaterialTopTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        tabBarStyle: { paddingTop: 45, backgroundColor: '#ffffff' },
        tabBarActiveTintColor: 'blue',
        tabBarIndicatorStyle: { backgroundColor: 'blue' }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Connexion' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ title: 'Micro' }} />
      <Tab.Screen name="RAVE" component={RaveScreen} options={{ title: 'RAVE' }} />
    </Tab.Navigator>
  );
}
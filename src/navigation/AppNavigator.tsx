import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import BudgetInputScreen from '../screens/BudgetInputScreen';
import ScanViewScreen from '../screens/ScanViewScreen';
import MainShoppingScreen from '../screens/MainShoppingScreen';
import RecentTripsScreen from '../screens/RecentTripsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoreSelector from '@/components/StoreSelector';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="BudgetInput" component={BudgetInputScreen} />
  <Stack.Screen name="ScanView" component={ScanViewScreen} />
  <Stack.Screen name="MainShopping" component={MainShoppingScreen} />
  <Stack.Screen name="RecentTrips" component={RecentTripsScreen} />
  <Stack.Screen name="Settings" component={SettingsScreen} />
  <Stack.Screen name="StoreSelector" component={StoreSelector} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
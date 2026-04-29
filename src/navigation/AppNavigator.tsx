import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import BudgetInputScreen from '../screens/BudgetInputScreen';
import ScanViewScreen from '../screens/ScanViewScreen';
import MainShoppingScreen from '../screens/MainShoppingScreen';
import RecentTripsScreen from '../screens/RecentTripsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoreSelector from '@/components/StoreSelector/StoreSelector';
import { BiometricProvider, useBiometric } from '../contexts/BiometricContext';
import LockScreen from '../screens/LockScreen';
import { LinearGradient } from 'expo-linear-gradient';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyleInterpolator: ({ current, layouts }: any) => {
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
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BudgetInput" component={BudgetInputScreen} />
      <Stack.Screen name="StoreSelector" component={StoreSelector} />
    </Stack.Navigator>
  );
}

function ShoppingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="MainShopping" 
        component={MainShoppingScreen}
        options={{ title: 'Shopping' }}
      />
      <Stack.Screen name="ScanView" component={ScanViewScreen} />
    </Stack.Navigator>
  );
}

function RecentTripsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="RecentTrips" 
        component={RecentTripsScreen}
        options={{ title: 'Recent Trips' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isLocked } = useBiometric();

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    // <LinearGradient colors={['#0F172A', '#1E3A5F']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'ShoppingTab') {
              iconName = focused ? 'bag' : 'bag-outline';
            } else if (route.name === 'RecentTripsTab') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'SettingsTab') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
            borderTopWidth: 1,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen
          name="ShoppingTab"
          component={ShoppingStack}
          options={{
            title: 'Shopping',
          }}
        />
        <Tab.Screen
          name="RecentTripsTab"
          component={RecentTripsStack}
          options={{
            title: 'History',
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{
            title: 'Settings',
          }}
        />
      </Tab.Navigator>
      // </LinearGradient>
  );
}

export default function AppNavigator() {
  return (
    <BiometricProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </BiometricProvider>
  );
}
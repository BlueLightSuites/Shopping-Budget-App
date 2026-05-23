import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import OnboardingScreen, { TERMS_STORAGE_KEY, TERMS_VERSION } from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import BudgetInputScreen from '../screens/BudgetInputScreen';
import StoreSelectorScreen from '../components/StoreSelector/StoreSelector';
import ScanViewScreen from '../screens/ScanViewScreen';
import MainShoppingScreen from '../screens/MainShoppingScreen';
import RecentTripsScreen from '../screens/RecentTripsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { BiometricProvider, useBiometric } from '../contexts/BiometricContext';
import LockScreen from '../screens/LockScreen';
import { useTheme } from '../contexts/ThemeContext';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

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
      <Stack.Screen name="StoreSelector" component={StoreSelectorScreen} />
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
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: 'Trip Detail' }}
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
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="TermsOfService"
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <OnboardingScreen viewOnly onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="PrivacyPolicy"
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <PrivacyPolicyScreen onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isLocked } = useBiometric();
  const { colors } = useTheme();
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(TERMS_STORAGE_KEY).then((value) => {
      setTermsAccepted(value === TERMS_VERSION);
    });
  }, []);

  // Still checking AsyncStorage — render nothing to avoid flash
  if (termsAccepted === null) return null;

  if (!termsAccepted) {
    return <OnboardingScreen onAccept={() => setTermsAccepted(true)} />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return (
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
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
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
# Bottom Tab Navigation Setup

## Overview

The app now includes a bottom tab navigation bar that allows users to easily navigate between different sections of the app.

## Navigation Structure

### Bottom Tabs (Main Navigation)

1. **Home Tab** - Home screen with shopping trip overview
2. **Shopping Tab** - Active shopping and scanning interface
3. **History Tab** - Recent trips and purchase history
4. **Settings Tab** - App settings and preferences

### Screen Organization

Each tab contains a stack navigator that manages:

- **HomeTab Stack**: Home → Budget Input → Store Selector
- **ShoppingTab Stack**: Main Shopping → Scan View
- **RecentTripsTab Stack**: Recent Trips
- **SettingsTab Stack**: Settings

## Tab Bar Styling

- **Active Tab Color**: `#4A90E2` (Blue)
- **Inactive Tab Color**: `#8E8E93` (Gray)
- **Height**: 60 pixels
- **Icons**: Ionicons from Expo Vector Icons
- **Labels**: Display under each icon

## Tab Icons

| Tab      | Icon (Inactive)  | Icon (Active) |
| -------- | ---------------- | ------------- |
| Home     | home-outline     | home          |
| Shopping | bag-outline      | bag           |
| History  | time-outline     | time          |
| Settings | settings-outline | settings      |

## Navigation Flow

### Typical User Journey

1. **Home Tab** → User sets budget and initiates shopping trip
2. **Shopping Tab** → User scans items and manages cart
3. **History Tab** → User reviews past shopping trips
4. **Settings Tab** → User configures app preferences

### Internal Navigation (Deep Linking)

All existing navigation calls remain unchanged:

- `navigation.navigate('BudgetInput')` - Works within HomeTab
- `navigation.navigate('ScanView')` - Works within ShoppingTab
- `navigation.navigate('MainShopping')` - Works within ShoppingTab
- `navigation.navigate('RecentTrips')` - Works within RecentTripsTab
- `navigation.navigate('Settings')` - Works within SettingsTab

## Implementation Details

### Files Modified

- `/src/navigation/AppNavigator.tsx` - Updated to use Bottom Tab Navigator

### Dependencies Used

- `@react-navigation/bottom-tabs` - Already installed
- `@expo/vector-icons` - Already installed

### No Breaking Changes

- All existing screen names remain the same
- All existing navigation calls work as before
- The app maintains smooth slide transitions between screens

## Customization Options

### To Modify Tab Colors

Edit the `tabBarActiveTintColor` and `tabBarInactiveTintColor` in `AppNavigator.tsx`

### To Adjust Tab Bar Height

Modify the `height` property in `tabBarStyle`

### To Add More Tabs

Add new `Tab.Screen` components within the `Tab.Navigator` in `AppNavigator.tsx`

### To Change Tab Icons

Update the `iconName` mapping in the `tabBarIcon` function

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner/AdBanner';
import { useBiometric } from '../contexts/BiometricContext';

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { biometricEnabled, isSupported, toggleBiometric } = useBiometric();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            alert('Logged out successfully');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your shopping trips and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear data logic
            alert('All data cleared');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#CCC" />}
    </TouchableOpacity>
  );

  const ToggleSetting = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: '#6EE7B7' }}
        thumbColor={value ? '#10B981' : '#FFF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Ad Banner */}
          <AdBanner size="medium" style={{ marginBottom: 24 }} />

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="person"
                title="Profile"
                subtitle="Manage your profile information"
                onPress={() => {
                  // TODO: Navigate to profile screen
                  alert('Profile settings coming soon');
                }}
              />
              <SettingItem
                icon="lock-closed"
                title="Password"
                subtitle="Change your password"
                onPress={() => {
                  // TODO: Navigate to password change screen
                  alert('Password settings coming soon');
                }}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionContent}>
              <ToggleSetting
                icon="notifications"
                title="Notifications"
                subtitle="Receive shopping alerts and deals"
                value={notifications}
                onToggle={setNotifications}
              />
              <ToggleSetting
                icon="moon"
                title="Dark Mode"
                subtitle="Use dark theme"
                value={darkMode}
                onToggle={setDarkMode}
              />
              <ToggleSetting
                icon="finger-print"
                title="Biometric Login"
                subtitle={isSupported ? 'Use Face ID or Touch ID to unlock' : 'Not available on this device'}
                value={biometricEnabled}
                onToggle={toggleBiometric}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="document-text"
                title="About"
                subtitle="Version 1.0.0"
                onPress={() => {
                  // TODO: Navigate to about screen
                  alert('Price Scanner v1.0.0\n\nSmart Shopping Made Easy');
                }}
              />
              <SettingItem
                icon="help-circle"
                title="Help & Support"
                subtitle="Get help or contact support"
                onPress={() => {
                  // TODO: Navigate to help screen
                  alert('Support contact: support@pricescanner.com');
                }}
              />
              <SettingItem
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={() => {
                  // TODO: Open privacy policy
                  alert('Opening privacy policy');
                }}
              />
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="trash"
                title="Clear All Data"
                subtitle="Delete all shopping trips and data"
                onPress={handleClearData}
                showChevron={false}
              />
            </View>
          </View>

          {/* Logout Section */}
          <AdBanner size="medium" style={{ marginBottom: 16 }} />
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default SettingsScreen;

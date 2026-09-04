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
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner/AdBanner';
import { useBiometric } from '../contexts/BiometricContext';
import { useAds } from '../contexts/AdContext';
import { PremiumUpsellModal } from '../components/PremiumUpsellModal/PremiumUpsellModal';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsiveContentStyle } from '../utilities/responsive';

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  // TODO v2.0: Implement push notifications with deal alerts and shopping reminders
  // This will require a backend + expo-notifications integration
  const { biometricEnabled, isSupported, toggleBiometric } = useBiometric();
  // const { isPremium } = useAds();
  const isPremium = true;
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const responsiveContentStyle = useResponsiveContentStyle();
  const [showUpsell, setShowUpsell] = useState(false);

  const handleManageSubscription = () => {
    const url = Platform.OS === 'ios'
      ? 'itms-apps://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Unable to Open',
        Platform.OS === 'ios'
          ? 'Please open the App Store app and go to your account settings to manage your subscription.'
          : 'Please open the Play Store app and go to your account settings to manage your subscription.'
      );
    });
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
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.settingItemBorder }]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
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
    <View style={[styles.settingItem, { borderBottomColor: colors.settingItemBorder }]}>
      <View style={styles.settingContent}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
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
          contentContainerStyle={[styles.contentContainer, responsiveContentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Ad Banner */}
          <AdBanner size="medium" style={{ marginBottom: 24 }} />

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="person"
                title="Profile"
                subtitle="Manage your profile information"
                onPress={() => navigation.navigate('Profile')}
              />
              {isPremium && (
                <SettingItem
                  icon="card"
                  title="Manage Subscription"
                  subtitle="View, change, or cancel your Premium subscription"
                  onPress={handleManageSubscription}
                />
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <ToggleSetting
                icon="notifications-outline"
                title="Notifications 🔜"
                subtitle="Deal alerts & shopping reminders — coming soon!"
                value={false}
                onToggle={() => Alert.alert('Coming Soon', 'Push notifications with deal alerts and shopping reminders are coming in a future update!')}
              />
              <ToggleSetting
                icon="moon"
                title="Dark Mode"
                subtitle="Use dark theme"
                value={isDarkMode}
                onToggle={toggleDarkMode}
              />
              <ToggleSetting
                icon="finger-print"
                title={`Biometric Login${!isPremium ? ' 🔒' : ''}`}
                subtitle={
                  !isPremium
                    ? 'Premium feature — tap to upgrade'
                    : isSupported
                      ? 'Use Face ID or Touch ID to unlock'
                      : 'Not available on this device'
                }
                value={isPremium ? biometricEnabled : false}
                onToggle={(value) => {
                  if (!isPremium) {
                    setShowUpsell(true);
                    return;
                  }
                  toggleBiometric(value);
                }}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="information-circle"
                title="About"
                subtitle={`Version ${Constants.expoConfig?.version ?? '1.0.0'} (Build ${Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1'})`}
                onPress={() => {
                  Alert.alert(
                    'Scrimpr',
                    `Version ${Constants.expoConfig?.version ?? '1.0.0'}\n\nSmart Shopping Made Easy\n\n© ${new Date().getFullYear()} Blue Light Suites LLC`,
                  );
                }}
              />
              <SettingItem
                icon="help-circle"
                title="Help & Support"
                subtitle="Get help or contact support"
                onPress={() => navigation.navigate('HelpSupport')}
              />
              <SettingItem
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={() => navigation.navigate('PrivacyPolicy')}
              />
              <SettingItem
                icon="document-text"
                title="Terms of Service"
                subtitle="Read our terms of service"
                onPress={() => navigation.navigate('TermsOfService')}
              />

            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              <SettingItem
                icon="trash"
                title="Clear All Data"
                subtitle="Delete all shopping trips and data"
                onPress={handleClearData}
                showChevron={false}
              />
            </View>
          </View>

        </ScrollView>
      </LinearGradient>

      <PremiumUpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="biometric lock"
      />
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
});

export default SettingsScreen;

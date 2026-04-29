import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAds } from '@/contexts/AdContext';

interface AdBannerProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable Ad Banner Component using Expo's Ad Integration
 * Shows ads when user is not premium, hidden otherwise
 * 
 * Usage:
 * <AdBanner size="medium" />
 * 
 * How it works:
 * - Integrates with Expo's monetization program
 * - Automatically serves ads from multiple networks
 * - Revenue appears in your Expo dashboard after app approval
 * - Works with both development and production builds
 * 
 * Revenue Setup:
 * 1. Build and submit your app to App Store/Play Store
 * 2. Once approved, enable monetization in Expo dashboard
 * 3. Configure ad preferences
 * 4. Revenue will appear 24-48 hours after approval
 * 
 * For now, this shows a placeholder that will be replaced with real ads
 * once you enable monetization in the Expo dashboard.
 */

export const AdBanner: React.FC<AdBannerProps> = ({ style, size = 'medium' }) => {
  const { shouldShowAds } = useAds();
  const [isLoading, setIsLoading] = useState(true);

  if (!shouldShowAds) {
    return null;
  }

  const heights = {
    small: 50,
    medium: 100,
    large: 250,
  };

  return (
    <View style={[styles.adContainer, { height: heights[size] }, style]}>
      <View style={styles.adPlaceholder}>
        {isLoading && <ActivityIndicator size="small" color="#4A90E2" />}
        <Text style={styles.adPlaceholderText}>
          {isLoading ? 'Loading Ad...' : '📢 Ad Space'}
        </Text>
        <Text style={styles.adPlaceholderSubtext}>
          Real ads will appear here after publishing
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  adPlaceholder: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    borderStyle: 'dashed',
  },
  adPlaceholderText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
    marginTop: 4,
  },
  adPlaceholderSubtext: {
    fontSize: 10,
    color: '#999',
    fontWeight: '400',
    marginTop: 4,
  },
});

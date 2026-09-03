import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsiveContentStyle } from '../utilities/responsive';

const PRIVACY_POLICY = `Last updated: May 22, 2026

This Privacy Policy describes how Blue Light Suites LLC ("we", "us", or "our") collects, uses, and protects your information when you use Scrimpr ("the app"). Please read this policy carefully.

1. INFORMATION WE COLLECT

a) Information you provide
• Display name and default budget — stored locally on your device only.
• Shopping trips, budgets, item lists, and store selections — stored locally on your device only. This data is never uploaded to our servers.

b) Information collected automatically
• Scanned barcodes and ZIP codes — sent to third-party retailer APIs (Kroger/Smith's and Walmart) solely to retrieve product pricing. This data is not retained by us.
• In-app purchase receipts — processed by Apple App Store or Google Play and verified through Qonversion to confirm your subscription status.
• Advertising identifiers (IDFA on iOS, GAID on Android) — may be collected by our ad network (Expo Monetization) and used to serve relevant banner ads to free-tier users.

2. HOW WE USE YOUR INFORMATION

We use the information described above to:
• Provide core app functionality (barcode lookups, budget tracking).
• Verify and manage your premium subscription status.
• Display relevant advertisements to free-tier users.
• Improve app performance and fix bugs.

We do not sell your personal data to third parties.

3. LOCAL DATA STORAGE

Your shopping history, preferences, and biometric lock settings are stored exclusively on your device using AsyncStorage. Clearing the app's data (Settings → Clear All Data) or uninstalling the app permanently removes this data.

4. CAMERA & MICROPHONE

The camera is used solely to scan product barcodes. No photos or video are captured, saved, or transmitted. Microphone access is requested for audio feedback only; no audio is recorded or stored.

5. BIOMETRIC AUTHENTICATION

Biometric lock (Face ID / Touch ID / fingerprint) is handled entirely by your device's operating system via Apple's LocalAuthentication or Android's BiometricPrompt frameworks. Scrimpr never accesses, stores, or transmits your biometric data.

6. THIRD-PARTY SERVICES

The following third-party services are used in Scrimpr. Each has its own privacy policy governing the data they receive:

a) Qonversion (Subscription Management)
   Purpose: Verifying and managing in-app purchase entitlements.
   Data shared: Purchase receipts, device identifiers, entitlement status.
   Privacy policy: https://qonversion.io/privacy-policy

b) Kroger / Smith's API
   Purpose: Retrieving real-time product prices by barcode.
   Data shared: ZIP code, scanned barcode numbers.
   Privacy policy: https://www.kroger.com/i/privacy-policy

c) Walmart API
   Purpose: Retrieving real-time product prices by barcode.
   Data shared: ZIP code, scanned barcode numbers, nearest store location.
   Privacy policy: https://corporate.walmart.com/privacy-security

d) Expo Monetization / Ad Networks
   Purpose: Serving banner advertisements to free-tier users.
   Data shared: Advertising identifiers (IDFA/GAID), device information, ad interaction signals.
   Note: Premium subscribers see no advertisements and are not subject to ad tracking through the app.
   Privacy policy: https://expo.dev/privacy

7. DATA RETENTION

All shopping data is stored locally and retained until you clear it or uninstall the app. Qonversion retains purchase and entitlement records per their own data retention policy. We do not maintain any server-side database of your personal information.

8. DATA DELETION

To delete all data stored by Scrimpr on your device:
• Go to Settings → Clear All Data within the app.
• Or uninstall the app from your device.

For deletion of purchase records held by Qonversion, please contact them directly at their privacy policy link above.

9. CHILDREN'S PRIVACY

Scrimpr is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided personal information through this app, please contact us and we will take steps to delete such information.

10. YOUR PRIVACY RIGHTS

Depending on your location, you may have rights under applicable law (including GDPR for EU residents and CCPA for California residents) to:
• Access the personal data we hold about you.
• Request correction or deletion of your data.
• Opt out of the sale of personal data (we do not sell your data).
• Limit the use of sensitive personal information.

To exercise any of these rights, please contact us using the information below.

11. ADVERTISING CHOICES

You can limit ad tracking on your device:
• iOS: Settings → Privacy & Security → Tracking → disable "Allow Apps to Request to Track".
• Android: Settings → Privacy → Ads → "Opt out of Ads Personalization".

12. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. If we make material changes, we will notify you within the app. Continued use of Scrimpr after changes take effect constitutes your acceptance of the updated policy.

13. CONTACT

If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:

support@bluelightsuitesllc.com
Blue Light Suites LLC`;

interface Props {
  onBack?: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: Props) {
  const { colors, isDarkMode } = useTheme();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const responsiveContentStyle = useResponsiveContentStyle();

  const p = {
    background: colors.background,
    card: colors.card,
    cardBorder: colors.cardBorder,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    scrollHintBg: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isAtBottom) setHasScrolledToBottom(true);
  };

  return (
    <View style={[styles.gradient, { backgroundColor: p.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={p.background} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#4A90E2" />
            <Text style={[styles.backText, { color: '#4A90E2' }]}>Back</Text>
          </TouchableOpacity>
          <Ionicons name="shield-checkmark" size={36} color="#4A90E2" />
          <Text style={[styles.appName, { color: p.textPrimary }]}>Scrimpr</Text>
          <Text style={[styles.version, { color: p.textMuted }]}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={[styles.subtitle, { color: p.textSecondary }]}>Privacy Policy</Text>
        </View>

        {/* Scrollable Policy */}
        <View style={[styles.scrollContainer, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, responsiveContentStyle]}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.bodyText, { color: p.textPrimary }]}>{PRIVACY_POLICY}</Text>
            <View style={styles.linkRow}>
              <Text style={[styles.linkNote, { color: p.textSecondary }]}>Questions? Email us at </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:bluelightsuitesllc+scrimpr@gmail.com')}>
                <Text style={styles.link}>bluelightsuitesllc+scrimpr@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          {!hasScrolledToBottom && (
            <View style={[styles.scrollHint, { backgroundColor: p.scrollHintBg }]}>
              <Ionicons name="chevron-down" size={16} color={p.textMuted} />
              <Text style={[styles.scrollHintText, { color: p.textMuted }]}>Scroll to read full policy</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    gap: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  version: {
    fontSize: 13,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 22,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  linkNote: {
    fontSize: 13,
  },
  link: {
    fontSize: 13,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  scrollHintText: {
    fontSize: 12,
  },
});

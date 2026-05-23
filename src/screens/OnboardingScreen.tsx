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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';

export const TERMS_VERSION = '1.0';
export const TERMS_STORAGE_KEY = '@terms_accepted_version';

const TERMS_OF_SERVICE = `Last updated: May 22, 2026

Welcome to Scrimpr. By using this app you agree to the following terms. Please read them carefully before continuing.

1. ACCEPTANCE OF TERMS

By tapping "Agree & Continue" you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use Scrimpr.

2. WHAT SCRIMPR DOES

Scrimpr is a personal shopping budget tool that uses barcode scanning and third-party retailer data to help you track spending. We do not guarantee the accuracy, completeness, or real-time availability of any price information displayed in the app. Prices shown are for reference only and may not reflect current in-store prices.

3. SUBSCRIPTION & BILLING

Scrimpr offers a free tier with ads and a premium (Scrimpr Pro) subscription. Premium subscriptions are billed through Apple App Store or Google Play Store and are subject to their respective billing policies.

• Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current billing period.
• You can manage or cancel your subscription in your device's App Store / Play Store account settings.
• Refunds are handled by Apple or Google, not by Blue Light Suites LLC. We are unable to issue refunds directly.
• Prices may vary by region and are displayed at the time of purchase.

4. USER DATA

Scrimpr stores your shopping trips and preferences locally on your device. We do not sell your personal data to third parties. For full details on what data we collect and how it is used, please review our Privacy Policy.

5. ADVERTISING

Free-tier users will see advertisements served by third-party providers (including Google AdMob). These providers may use cookies or device identifiers in accordance with their own privacy policies.

6. PROHIBITED USE

You agree not to:
• Reverse engineer, decompile, or disassemble any part of the app.
• Use the app to scrape, harvest, or misuse retailer pricing APIs.
• Attempt to circumvent any subscription or feature restriction.
• Use the app for any unlawful purpose.

7. DISCLAIMER OF WARRANTIES

Scrimpr is provided "as-is" and "as-available" without warranties of any kind, either express or implied. We do not warrant that the app will be uninterrupted or error-free, and we are not responsible for any interruptions or technical issues outside of our control.

8. LIMITATION OF LIABILITY

To the fullest extent permitted by law, Blue Light Suites LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use Scrimpr, including but not limited to purchasing decisions made based on information displayed in the app.

9. CHANGES TO THESE TERMS

We reserve the right to update these Terms of Service at any time. If we make material changes, we will notify you by prompting you to review and re-accept the updated terms. Continued use of the app after changes take effect constitutes your acceptance of the revised terms.

10. GOVERNING LAW

These terms are governed by the laws of the State of Utah, United States, without regard to its conflict of law provisions.

11. CONTACT

If you have any questions about these Terms of Service, please contact us at:

support@bluelightsuitesllc.com
Blue Light Suites LLC`;

interface Props {
  onAccept?: () => void;
  viewOnly?: boolean;
  onBack?: () => void;
}

// Fixed light-mode palette used for the initial onboarding gate
const lightPalette = {
  background: '#FFFFFF',
  card: '#F1F5F9',
  cardBorder: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  scrollHintBg: 'rgba(0,0,0,0.05)',
  checkboxDisabled: '#CBD5E1',
};

export default function OnboardingScreen({ onAccept, viewOnly = false, onBack }: Props) {
  const { colors, isDarkMode } = useTheme();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // Onboarding (first launch) always uses light palette.
  // Settings view follows the active theme.
  const p = viewOnly
    ? {
        background: colors.background,
        card: colors.card,
        cardBorder: colors.cardBorder,
        textPrimary: colors.textPrimary,
        textSecondary: colors.textSecondary,
        textMuted: colors.textMuted,
        scrollHintBg: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
        checkboxDisabled: colors.inputBorder,
      }
    : lightPalette;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem(TERMS_STORAGE_KEY, TERMS_VERSION);
    onAccept?.();
  };

  return (
    <View style={[styles.gradient, { backgroundColor: p.background }]}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {viewOnly && (
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#4A90E2" />
              <Text style={[styles.backText, { color: '#4A90E2' }]}>Back</Text>
            </TouchableOpacity>
          )}
          <Ionicons name="bag-handle" size={36} color="#4A90E2" />
          <Text style={[styles.appName, { color: p.textPrimary }]}>Scrimpr</Text>
          <Text style={[styles.version, { color: p.textMuted }]}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={[styles.subtitle, { color: p.textSecondary }]}>
            {viewOnly
              ? 'Terms of Service'
              : 'Before you start saving, please review and accept our Terms of Service.'}
          </Text>
        </View>

        {/* Scrollable ToS */}
        <View style={[styles.scrollContainer, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.termsText, { color: p.textPrimary }]}>{TERMS_OF_SERVICE}</Text>
            <View style={styles.privacyRow}>
              <Text style={[styles.privacyNote, { color: p.textSecondary }]}>You can also read our full </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.bluelightsuitesllc.com/privacy')}>
                <Text style={styles.privacyLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={[styles.privacyNote, { color: p.textSecondary }]}>.</Text>
            </View>
          </ScrollView>
          {!hasScrolledToBottom && (
            <View style={[styles.scrollHint, { backgroundColor: p.scrollHintBg }]}>
              <Ionicons name="chevron-down" size={16} color={p.textMuted} />
              <Text style={[styles.scrollHintText, { color: p.textMuted }]}>Scroll to read all terms</Text>
            </View>
          )}
        </View>

        {/* Checkbox + Button */}
        {!viewOnly && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAgreed(!isAgreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isAgreed && styles.checkboxChecked, !isAgreed && { borderColor: p.checkboxDisabled }]}>
                {isAgreed && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={[styles.checkboxLabel, { color: p.textPrimary }]}>
                I have read and agree to the{' '}
                <Text style={styles.linkText}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, !isAgreed && styles.buttonDisabled]}
              onPress={handleAccept}
              disabled={!isAgreed}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Agree & Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}
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
  termsText: {
    fontSize: 13,
    lineHeight: 22,
  },
  privacyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  privacyNote: {
    fontSize: 13,
  },
  privacyLink: {
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
  footer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: '#4A90E2',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

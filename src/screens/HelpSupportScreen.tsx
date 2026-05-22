import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
  Share,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUPPORT_EMAIL = 'bluelightsuitesllc+scrimpr@gmail.com';
const APP_STORE_ID = '6768889539';

const FAQ_ITEMS = [
  {
    question: "Why isn't my barcode being recognized?",
    answer:
      'Some products may not be in our database yet. Try scanning in good lighting and holding steady. If the barcode still isn\'t found, you can add the item manually using the "Add Manually" option.',
  },
  {
    question: 'How does the budget work?',
    answer:
      'Enter your budget before starting a shopping trip. As you scan items, the app tracks your running total and alerts you when you\'re approaching or over your limit.',
  },
  {
    question: 'Which stores are supported?',
    answer:
      'Scrimpr currently supports Walmart and Kroger/Smith\'s for real-time pricing. More stores will be added in the future.',
  },
  {
    question: 'What is Scrimpr Premium?',
    answer:
      'Premium removes ads, unlocks biometric login, and gives you unlimited trip history. You can upgrade from the Settings screen.',
  },
  {
    question: 'How do I restore my premium purchase?',
    answer:
      'Go to Settings → Upgrade to Premium and tap "Restore Purchases". Make sure you\'re signed in with the same Apple ID used for the original purchase.',
  },
  {
    question: 'Is my data stored in the cloud?',
    answer:
      'All your shopping trips are stored locally on your device. No account is required and your data never leaves your phone.',
  },
  {
    question: 'How do I delete my data?',
    answer:
      'Go to Settings → Clear All Data. This permanently removes all saved trips from your device.',
  },
];

const FAQItem = ({
  question,
  answer,
  colors,
}: {
  question: string;
  answer: string;
  colors: any;
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <TouchableOpacity
      style={[styles.faqItem, { backgroundColor: colors.card, borderBottomColor: colors.settingItemBorder }]}
      onPress={toggle}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#10B981"
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary ?? '#666' }]}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Scrimpr%20Support%20Request`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch (_) {
      // fall through to alert
    }
    // Fallback: no mail app or openURL failed (common in iOS Simulator)
    Alert.alert(
      'Contact Support',
      `No mail app was found on this device. You can reach us at:\n\n${SUPPORT_EMAIL}`,
      [
        {
          text: 'Share Email',
          onPress: () => Share.share({ message: SUPPORT_EMAIL }),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleRateApp = async () => {
    const itmsUrl = `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`;
    const httpsUrl = `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
    try {
      const supported = await Linking.canOpenURL(itmsUrl);
      if (supported) {
        await Linking.openURL(itmsUrl);
        return;
      }
      await Linking.openURL(httpsUrl);
    } catch (e) {
      Alert.alert(
        'Unable to Open App Store',
        `You can find us on the App Store by searching "Scrimpr" or visit:\n\n${httpsUrl}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                colors={colors}
              />
            ))}
          </View>

          {/* Contact Section */}
          <Text style={styles.sectionTitle}>Still need help?</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.actionRow} onPress={handleEmail}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="mail" size={22} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                    Contact Support
                  </Text>
                  <Text style={styles.actionSubtitle}>{SUPPORT_EMAIL}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.settingItemBorder }]} />

            <TouchableOpacity style={styles.actionRow} onPress={handleRateApp}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="star" size={22} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                    Rate Scrimpr
                  </Text>
                  <Text style={styles.actionSubtitle}>Leave a review on the App Store</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqList: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 28,
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default HelpSupportScreen;

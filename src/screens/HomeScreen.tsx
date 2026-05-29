import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner/AdBanner';
import { loadTrips } from '../utilities/tripStorage';
import { useAds } from '../contexts/AdContext';
import { useTheme } from '../contexts/ThemeContext';
import { PremiumUpsellModal } from '../components/PremiumUpsellModal/PremiumUpsellModal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isPremium } = useAds();
  const { colors, isDarkMode } = useTheme();
  const [totalSaved, setTotalSaved] = useState(0);
  const [tripsThisMonth, setTripsThisMonth] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [allTimeSaved, setAllTimeSaved] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTrips().then((trips) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const saved = trips.reduce((sum, t) => sum + Math.max(0, t.budget - t.spent), 0);
        const monthCount = trips.filter((t) => {
          const d = new Date(t.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;
        setTotalSaved(saved);
        setTripsThisMonth(monthCount);
        setTotalTrips(trips.length);
        setAllTimeSaved(trips.reduce((sum, t) => sum + Math.max(0, t.budget - t.spent), 0));
      });
    }, [])
  );

  const handleStartShopping = () => {
    navigation.navigate('BudgetInput');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Dark navy header */}
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
        <Ionicons name="scan" size={32} color="white" />
        <Text style={styles.headerTitle}>Scrimpr</Text>
        <Text style={styles.headerSubtitle}>Smart Shopping Made Easy</Text>
      </LinearGradient>

      {/* Light content area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>${totalSaved.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Saved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={styles.statEmoji}>🛒</Text>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{tripsThisMonth}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trips This Month</Text>
          </View>
        </View>

        

        {/* Main Action Button */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleStartShopping}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#10B981', '#059669']} style={styles.buttonGradient}>
            <Ionicons name="add-circle" size={28} color="white" />
            <View style={styles.buttonTextWrap}>
              <Text style={styles.buttonText}>Start New Shopping Trip</Text>
              <Text style={styles.buttonSubtext}>Set budget and start scanning</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Ad Banner */}
        <AdBanner size="medium" style={{ marginBottom: 16 }} />

        {/* Feature rows */}
        {/* <View style={styles.featureCard}>
          <Ionicons name="ellipse" size={14} color="#10B981" />
          <Text style={styles.featureText}>Scan barcodes instantly</Text>
        </View>
        <View style={styles.featureCard}>
          <Ionicons name="ellipse" size={14} color="#10B981" />
          <Text style={styles.featureText">Track your budget</Text>
        </View>
        <View style={styles.featureCard}>
          <Ionicons name="ellipse" size={14} color="#10B981" />
          <Text style={styles.featureText}>Save money on groceries</Text>
        </View> */}

        {/* All-Time Summary — Premium only */}
        {isPremium ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>All-Time Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="receipt-outline" size={20} color="#10B981" />
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{totalTrips}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Trips</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.sectionDivider }]} />
              <View style={styles.summaryItem}>
                <Ionicons name="trending-down-outline" size={20} color="#10B981" />
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>${allTimeSaved.toFixed(2)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Saved</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.sectionDivider }]} />
              <View style={styles.summaryItem}>
                <Ionicons name="calendar-outline" size={20} color="#10B981" />
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{tripsThisMonth}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>This Month</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.lockedSummaryCard}
            onPress={() => setShowUpsell(true)}
            activeOpacity={0.85}
          >
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={22} color="#F59E0B" />
              <Text style={styles.lockedTitle}>All-Time Summary</Text>
              <Text style={styles.lockedSubtext}>Upgrade to Premium to see your total trips, all-time savings & more</Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.lockedBadgeText}>Premium</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* How it Works */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HOW IT WORKS</Text>
        <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.stepBadge}><Text style={styles.stepNumber}>1</Text></View>
          <View style={styles.stepTextWrap}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Set Your Budget</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Enter how much you want to spend before you shop.</Text>
          </View>
        </View>
        <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.stepBadge}><Text style={styles.stepNumber}>2</Text></View>
          <View style={styles.stepTextWrap}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Scan Barcodes</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Point your camera at any barcode to look up prices instantly.</Text>
          </View>
        </View>
        <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.stepBadge}><Text style={styles.stepNumber}>3</Text></View>
          <View style={styles.stepTextWrap}>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Track & Save</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Watch your remaining balance update in real time as you shop.</Text>
          </View>
        </View>

        {/* Top Ad Banner */}
        <AdBanner size="medium" style={{ marginBottom: 16 }} />
      </ScrollView>

      <PremiumUpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="all-time analytics"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  mainButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 14,
  },
  buttonTextWrap: {
    flex: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  featureText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },

  // All-time summary card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // How it works steps
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },

  // Locked (free-tier) summary card
  lockedSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lockedOverlay: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 6,
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  lockedSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
});

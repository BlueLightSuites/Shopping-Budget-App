import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ShoppingTrip, RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner/AdBanner';
import { loadTrips } from '../utilities/tripStorage';
import { useAds, FREE_TRIP_LIMIT } from '../contexts/AdContext';
import { PremiumUpsellModal } from '../components/PremiumUpsellModal/PremiumUpsellModal';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsiveContentStyle } from '../utilities/responsive';

type RecentTripsNavigationProp = StackNavigationProp<RootStackParamList, 'RecentTrips'>;

const PAGE_SIZE = 10;

const RecentTripsScreen = () => {
  const navigation = useNavigation<RecentTripsNavigationProp>();
  const { isPremium } = useAds();
  const { colors, isDarkMode } = useTheme();
  const responsiveContentStyle = useResponsiveContentStyle();
  const [trips, setTrips] = useState<ShoppingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setVisibleCount(PAGE_SIZE);
      loadTrips().then((data) => {
        if (active) {
          setTrips(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  const handleEndReached = useCallback(() => {
    if (loadingMore || visibleCount >= trips.length) return;
    setLoadingMore(true);
    // Small delay to show the loading indicator, giving a natural feel
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, trips.length));
      setLoadingMore(false);
    }, 400);
  }, [loadingMore, visibleCount, trips.length]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    if (d >= startOfToday) return `Today at ${timeStr}`;
    if (d >= startOfYesterday) return `Yesterday at ${timeStr}`;
    const diffDays = Math.floor((startOfToday.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${d.toLocaleDateString([], { weekday: 'long' })} at ${timeStr}`;
    }
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      ...(sameYear ? {} : { year: 'numeric' }),
    }) + ` at ${timeStr}`;
  };

  const isThisMonth = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const renderTripItem = ({ item, index }: { item: ShoppingTrip; index: number }) => (
    <View key={item.id}>
      <TouchableOpacity
        style={[styles.tripCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.tripHeader, { borderBottomColor: colors.divider }]}>
          <View style={styles.tripInfo}>
            <Text style={[styles.tripDate, { color: colors.textPrimary }]}>{formatDate(item.createdAt)}</Text>
            <Text style={[styles.tripBudget, { color: colors.textSecondary }]}>Budget: ${item.budget.toFixed(2)}</Text>
            {item.stores && item.stores.length > 0 && (
              <View style={styles.storeChips}>
                {Array.from(new Set(item.stores)).map((s) => (
                  <View
                    key={s}
                    style={[styles.storeChip, { backgroundColor: s === 'walmart' ? '#0071CE' : '#E31837' }]}
                  >
                    <Text style={styles.storeChipText}>
                      {s === 'walmart' ? 'Walmart' : "Smith's"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </View>
        <View style={styles.tripStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Spent</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>${item.spent.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Remaining</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              ${item.remaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {(((item.budget - item.spent) / item.budget) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {(index + 1) % 2 === 0 && <AdBanner size="medium" style={{ marginVertical: 8 }} />}
    </View>
  );

  /** Build a flat list of section-header + trip rows for FlatList */
  type ListRow =
    | { type: 'header'; label: string }
    | { type: 'trip'; trip: ShoppingTrip; globalIndex: number }
    | { type: 'locked'; hiddenCount: number };

  const listData = useMemo<ListRow[]>(() => {
    // Free users see at most FREE_TRIP_LIMIT trips; premium users see all (paginated)
    const cap = isPremium ? visibleCount : Math.min(FREE_TRIP_LIMIT, trips.length);
    const visible = trips.slice(0, cap);
    const thisMonth = visible.filter((t) => isThisMonth(t.createdAt));
    const older = visible.filter((t) => !isThisMonth(t.createdAt));
    const rows: ListRow[] = [];
    if (thisMonth.length > 0) {
      rows.push({ type: 'header', label: 'THIS MONTH' });
      thisMonth.forEach((trip, i) => rows.push({ type: 'trip', trip, globalIndex: i }));
    }
    if (older.length > 0) {
      rows.push({ type: 'header', label: 'EARLIER' });
      older.forEach((trip, i) =>
        rows.push({ type: 'trip', trip, globalIndex: i + thisMonth.length })
      );
    }
    // Append locked row for free users if there are more trips beyond the cap
    if (!isPremium && trips.length > FREE_TRIP_LIMIT) {
      rows.push({ type: 'locked', hiddenCount: trips.length - FREE_TRIP_LIMIT });
    }
    return rows;
  }, [trips, visibleCount, isPremium]);

  const renderRow = ({ item }: { item: ListRow }) => {
    if (item.type === 'header') {
      return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{item.label}</Text>;
    }
    if (item.type === 'locked') {
      return (
        <TouchableOpacity
          style={styles.lockedCard}
          onPress={() => setShowUpsell(true)}
          activeOpacity={0.85}
        >
          <View style={styles.lockedCardInner}>
            <Ionicons name="lock-closed" size={22} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.lockedCardTitle}>
                {item.hiddenCount} more trip{item.hiddenCount !== 1 ? 's' : ''} hidden
              </Text>
              <Text style={styles.lockedCardSubtext}>
                Upgrade to Premium to unlock your full trip history
              </Text>
            </View>
            <View style={styles.lockedCardBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.lockedCardBadgeText}>Premium</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return renderTripItem({ item: item.trip, index: item.globalIndex });
  };

  const ListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#10B981" />
        <Text style={styles.footerLoaderText}>Loading more trips…</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
          <Text style={styles.headerTitle}>Recent Trips</Text>
          <Text style={styles.headerSubtitle}>Your shopping history</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Dark navy header */}
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
        <Ionicons name="clipboard" size={30} color="white" />
        <Text style={styles.headerTitle}>Recent Trips</Text>
        <Text style={styles.headerSubtitle}>Your shopping history</Text>
      </LinearGradient>

      {/* Light content area */}
      {trips.length > 0 ? (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => {
            if (item.type === 'header') return `header-${item.label}`;
            if (item.type === 'locked') return 'locked-row';
            return `trip-${item.trip.id}-${index}`;
          }}
          renderItem={renderRow}
          contentContainerStyle={[styles.scrollContent, responsiveContentStyle]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={<ListFooter />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No shopping trips yet</Text>
          <Text style={styles.emptySubtext}>Start a new shopping trip to get started</Text>
        </View>
      )}

      <PremiumUpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="unlimited trip history"
      />
    </SafeAreaView>
  );
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  tripBudget: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#64748B',
  },
  storeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  storeChip: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  storeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },

  // Locked (free-tier) upgrade card
  lockedCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lockedCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  lockedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  lockedCardSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  lockedCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    marginLeft: 8,
  },
  lockedCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
});

export default RecentTripsScreen;

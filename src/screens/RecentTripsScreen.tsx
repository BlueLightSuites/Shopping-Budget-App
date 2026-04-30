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

type RecentTripsNavigationProp = StackNavigationProp<RootStackParamList, 'RecentTrips'>;

const PAGE_SIZE = 10;

const RecentTripsScreen = () => {
  const navigation = useNavigation<RecentTripsNavigationProp>();
  const [trips, setTrips] = useState<ShoppingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

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
        style={styles.tripCard}
        onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.tripBudget}>Budget: ${item.budget.toFixed(2)}</Text>
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
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>${item.spent.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              ${item.remaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Saved</Text>
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
    | { type: 'trip'; trip: ShoppingTrip; globalIndex: number };

  const listData = useMemo<ListRow[]>(() => {
    const visible = trips.slice(0, visibleCount);
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
    return rows;
  }, [trips, visibleCount]);

  const renderRow = ({ item }: { item: ListRow }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionLabel}>{item.label}</Text>;
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

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
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${item.label}` : `trip-${item.trip.id}-${index}`
          }
          renderItem={renderRow}
          contentContainerStyle={styles.scrollContent}
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
});

export default RecentTripsScreen;

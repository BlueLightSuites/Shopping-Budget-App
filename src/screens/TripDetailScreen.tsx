import React, { useEffect, useState, useCallback } from 'react';
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
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, ShoppingTrip, CartItem, StoreId } from '../types';
import { loadTrips } from '../utilities/tripStorage';

type Props = StackScreenProps<RootStackParamList, 'TripDetail'>;

const WALMART_COLOR = '#0071CE';
const SMITHS_COLOR = '#E31837';
const GREEN = '#10B981';
const AMBER = '#F59E0B';

const storeLabel = (s: StoreId) => (s === 'walmart' ? 'Walmart' : "Smith's");
const storeColor = (s: StoreId) => (s === 'walmart' ? WALMART_COLOR : SMITHS_COLOR);

const TripDetailScreen = ({ route, navigation }: Props) => {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<ShoppingTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips().then((trips) => {
      const found = trips.find((t) => t.id === tripId) ?? null;
      setTrip(found);
      setLoading(false);
    });
  }, [tripId]);

  const formatFullDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const formatTime = useCallback((date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, []);

  const formatDuration = useCallback((start: Date, end: Date) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const totalMinutes = Math.round(ms / 60000);
    if (totalMinutes < 1) return 'Less than a minute';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Trip not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived data ─────────────────────────────────────────────
  const spentRatio = Math.min(trip.spent / trip.budget, 1);
  const isOverBudget = trip.spent > trip.budget;
  const progressColor = isOverBudget ? '#EF4444' : spentRatio > 0.85 ? AMBER : GREEN;

  const totalItemCount = trip.items.reduce((sum, i) => sum + i.quantity, 0);
  const avgItemCost = totalItemCount > 0 ? trip.spent / totalItemCount : 0;

  // Per-store subtotals
  const storeSubtotals: Partial<Record<StoreId, number>> = {};
  trip.items.forEach((ci) => {
    if (ci.storeId) {
      storeSubtotals[ci.storeId] = (storeSubtotals[ci.storeId] ?? 0) + ci.totalPrice;
    }
  });
  const storeEntries = Object.entries(storeSubtotals) as [StoreId, number][];

  // Group items by store for the receipt list
  const stores = trip.stores ?? [];
  const groupedItems: { store: StoreId | null; items: CartItem[] }[] = [];

  if (stores.length > 1) {
    stores.forEach((s) => {
      const storeItems = trip.items.filter((i) => i.storeId === s);
      if (storeItems.length > 0) groupedItems.push({ store: s, items: storeItems });
    });
    // Items with no storeId
    const unassigned = trip.items.filter((i) => !i.storeId);
    if (unassigned.length > 0) groupedItems.push({ store: null, items: unassigned });
  } else {
    groupedItems.push({ store: stores[0] ?? null, items: trip.items });
  }

  // Flat list data
  type Row =
    | { type: 'summary' }
    | { type: 'storeHeader'; store: StoreId | null }
    | { type: 'item'; item: CartItem; storeColor: string }
    | { type: 'storeDivider'; store: StoreId | null; subtotal: number }
    | { type: 'storeBreakdown' };

  const listData: Row[] = [{ type: 'summary' }];

  groupedItems.forEach(({ store, items }) => {
    if (stores.length > 1) {
      listData.push({ type: 'storeHeader', store });
    }
    items.forEach((item) => {
      listData.push({
        type: 'item',
        item,
        storeColor: store ? storeColor(store) : '#64748B',
      });
    });
    if (stores.length > 1 && store) {
      listData.push({ type: 'storeDivider', store, subtotal: storeSubtotals[store] ?? 0 });
    }
  });

  if (storeEntries.length > 1) {
    listData.push({ type: 'storeBreakdown' });
  }

  const renderRow = ({ item: row }: { item: Row }) => {
    // ── Summary card ──────────────────────────────────────────
    if (row.type === 'summary') {
      return (
        <View style={styles.summaryCard}>
          {/* Date & time */}
          <View style={styles.summaryDateRow}>
            <Ionicons name="calendar-outline" size={15} color="#64748B" />
            <Text style={styles.summaryDateText}>
              {formatFullDate(trip.createdAt)} · {formatTime(trip.createdAt)}
            </Text>
          </View>

          {/* Duration */}
          {trip.completedAt && (
            <View style={styles.summaryDateRow}>
              <Ionicons name="time-outline" size={15} color="#64748B" />
              <Text style={styles.summaryDateText}>
                Completed in {formatDuration(trip.createdAt, trip.completedAt)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Budget progress */}
          <Text style={styles.summaryLabel}>BUDGET</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressSpent}>${trip.spent.toFixed(2)}</Text>
            <Text style={styles.progressBudget}> / ${trip.budget.toFixed(2)}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${spentRatio * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={[styles.progressCaption, { color: progressColor }]}>
            {isOverBudget
              ? `$${(trip.spent - trip.budget).toFixed(2)} over budget`
              : `$${trip.remaining.toFixed(2)} remaining · ${(((trip.budget - trip.spent) / trip.budget) * 100).toFixed(1)}% saved`}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{totalItemCount}</Text>
              <Text style={styles.quickStatLabel}>
                {totalItemCount === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>${avgItemCost.toFixed(2)}</Text>
              <Text style={styles.quickStatLabel}>Avg / Item</Text>
            </View>
            {storeEntries.length > 1 && (
              <>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatValue}>{storeEntries.length}</Text>
                  <Text style={styles.quickStatLabel}>Stores</Text>
                </View>
              </>
            )}
          </View>

          {/* Section title */}
          <View style={[styles.divider, { marginBottom: 0 }]} />
          <Text style={[styles.summaryLabel, { marginTop: 16, marginBottom: 0 }]}>ITEMS</Text>
        </View>
      );
    }

    // ── Store group header ────────────────────────────────────
    if (row.type === 'storeHeader') {
      return (
        <View
          style={[
            styles.storeGroupHeader,
            { borderLeftColor: row.store ? storeColor(row.store) : '#64748B' },
          ]}
        >
          <Text style={styles.storeGroupHeaderText}>
            {row.store ? storeLabel(row.store) : 'Other'}
          </Text>
        </View>
      );
    }

    // ── Item row ──────────────────────────────────────────────
    if (row.type === 'item') {
      const { item, storeColor: sc } = row;
      return (
        <View style={styles.itemRow}>
          <View style={[styles.itemStoreAccent, { backgroundColor: sc }]} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name || item.product.description || 'Unknown Item'}
            </Text>
            {item.product.brand ? (
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
            ) : null}
          </View>
          <View style={styles.itemPricing}>
            {item.quantity > 1 && (
              <Text style={styles.itemQtyPrice}>
                {item.quantity} × ${item.product.price.toFixed(2)}
              </Text>
            )}
            <Text style={styles.itemTotal}>${item.totalPrice.toFixed(2)}</Text>
          </View>
        </View>
      );
    }

    // ── Store subtotal divider ────────────────────────────────
    if (row.type === 'storeDivider') {
      return (
        <View style={styles.storeSubtotalRow}>
          <Text style={styles.storeSubtotalLabel}>
            {row.store ? storeLabel(row.store) : 'Other'} Subtotal
          </Text>
          <Text style={styles.storeSubtotalValue}>${row.subtotal.toFixed(2)}</Text>
        </View>
      );
    }

    // ── Multi-store breakdown ─────────────────────────────────
    if (row.type === 'storeBreakdown') {
      return (
        <View style={styles.breakdownCard}>
          <Text style={styles.summaryLabel}>STORE BREAKDOWN</Text>
          {storeEntries.map(([s, total]) => (
            <View key={s} style={styles.breakdownRow}>
              <View style={styles.breakdownStoreLabel}>
                <View style={[styles.breakdownDot, { backgroundColor: storeColor(s) }]} />
                <Text style={styles.breakdownStoreName}>{storeLabel(s)}</Text>
              </View>
              <Text style={styles.breakdownAmount}>${total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="white" />
          <Text style={styles.backText}>History</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Detail</Text>
        <View style={styles.storeChipsRow}>
          {(trip.stores ?? []).map((s) => (
            <View key={s} style={[styles.storeChip, { backgroundColor: storeColor(s) }]}>
              <Text style={styles.storeChipText}>{storeLabel(s)}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={listData}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
  },

  // Header
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  storeChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  storeChip: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  storeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },

  // Summary card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  summaryDateText: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressSpent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  progressBudget: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCaption: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },

  // Store group header
  storeGroupHeader: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 6,
    marginTop: 10,
  },
  storeGroupHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },

  // Item rows
  itemRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemStoreAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  itemInfo: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  itemBrand: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
    paddingRight: 14,
    paddingVertical: 12,
  },
  itemQtyPrice: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Store subtotal
  storeSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 4,
  },
  storeSubtotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  storeSubtotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Store breakdown card
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  breakdownStoreLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownStoreName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
});

export default TripDetailScreen;

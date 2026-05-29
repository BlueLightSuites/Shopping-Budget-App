import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTrips } from '../utilities/tripStorage';
import { useTheme } from '../contexts/ThemeContext';
import { useAds } from '../contexts/AdContext';
import { PremiumUpsellModal } from '../components/PremiumUpsellModal/PremiumUpsellModal';
import { ShoppingTrip, StoreId } from '../types';

const PROFILE_NAME_KEY = '@profile_display_name';
const PROFILE_DEFAULT_BUDGET_KEY = '@profile_default_budget';
const PROFILE_PREFERRED_STORE_KEY = '@profile_preferred_store';

type PreferredStore = StoreId | 'none';

const storeOptions: { value: PreferredStore; label: string; icon: string }[] = [
  { value: 'none', label: 'No Preference', icon: 'storefront-outline' },
  { value: 'walmart', label: 'Walmart', icon: 'cart-outline' },
  { value: 'kroger', label: "Smith's Food & Drug", icon: 'leaf-outline' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const { isPremium: _isPremium } = useAds();
  const isPremium = _isPremium;
  const [showUpsell, setShowUpsell] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [defaultBudget, setDefaultBudget] = useState('');
  const [preferredStore, setPreferredStore] = useState<PreferredStore>('none');

  // Stats
  const [trips, setTrips] = useState<ShoppingTrip[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit state
  const [editingName, setEditingName] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');

  // Load saved profile
  useEffect(() => {
    const load = async () => {
      const [name, budget, store] = await Promise.all([
        AsyncStorage.getItem(PROFILE_NAME_KEY),
        AsyncStorage.getItem(PROFILE_DEFAULT_BUDGET_KEY),
        AsyncStorage.getItem(PROFILE_PREFERRED_STORE_KEY),
      ]);
      if (name) setDisplayName(name);
      if (budget) setDefaultBudget(budget);
      if (store) setPreferredStore(store as PreferredStore);
    };
    load();
  }, []);

  // Load trip stats on focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setStatsLoading(true);
      loadTrips().then((data) => {
        if (active) {
          setTrips(data);
          setStatsLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  // ── Computed stats ──────────────────────────────────────────────
  const totalTrips = trips.length;
  const totalSpent = trips.reduce((s, t) => s + t.spent, 0);
  const totalSaved = trips.reduce((s, t) => s + Math.max(0, t.budget - t.spent), 0);
  const avgSpent = totalTrips > 0 ? totalSpent / totalTrips : 0;
  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);
  const savingsRate = totalBudget > 0 ? (totalSaved / totalBudget) * 100 : 0;

  const onBudgetTrips = trips.filter((t) => t.spent <= t.budget).length;
  const onBudgetRate = totalTrips > 0 ? (onBudgetTrips / totalTrips) * 100 : 0;

  const now = new Date();
  const tripsThisMonth = trips.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalItems = trips.reduce((s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0), 0);
  const avgItems = totalTrips > 0 ? totalItems / totalTrips : 0;

  const bestSaving = trips.reduce((best, t) => Math.max(best, Math.max(0, t.budget - t.spent)), 0);
  const biggestTrip = trips.reduce((best, t) => Math.max(best, t.spent), 0);

  const mostUsedStore: string = (() => {
    const counts: Record<string, number> = {};
    trips.forEach((t) => {
      (t.stores ?? []).forEach((s) => {
        counts[s] = (counts[s] ?? 0) + 1;
      });
    });
    const entries = Object.entries(counts);
    if (!entries.length) return '—';
    const top = entries.sort((a, b) => b[1] - a[1])[0][0];
    return top === 'walmart' ? 'Walmart' : "Smith's";
  })();

  // ── Handlers ────────────────────────────────────────────────────
  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter a display name.');
      return;
    }
    await AsyncStorage.setItem(PROFILE_NAME_KEY, trimmed);
    setDisplayName(trimmed);
    setEditingName(false);
  };

  const saveBudget = async () => {
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    const str = parsed.toFixed(2);
    await AsyncStorage.setItem(PROFILE_DEFAULT_BUDGET_KEY, str);
    setDefaultBudget(str);
    setEditingBudget(false);
  };

  const selectStore = async (value: PreferredStore) => {
    await AsyncStorage.setItem(PROFILE_PREFERRED_STORE_KEY, value);
    setPreferredStore(value);
  };

  // ── Sub-components ───────────────────────────────────────────────
  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={styles.sectionLabel}>{label}</Text>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {children}
    </View>
  );

  const Divider = () => (
    <View style={[styles.divider, { backgroundColor: colors.settingItemBorder }]} />
  );

  const StatItem = ({
    icon,
    label,
    value,
    color = '#10B981',
  }: {
    icon: string;
    label: string;
    value: string;
    color?: string;
  }) => (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={22} color={color} style={styles.statIcon} />
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.avatarName}>
              {displayName || 'Set your name'}
            </Text>
            <Text style={styles.avatarSubtitle}>Scrimpr Shopper</Text>
          </View>

          {/* ── Identity ─────────────────────────────── */}
          <SectionLabel label="IDENTITY" />
          <Card>
            {/* Display Name */}
            <View style={styles.row}>
              <Ionicons name="person-outline" size={22} color="#10B981" />
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Display Name</Text>
                {editingName ? (
                  <View style={styles.inlineEdit}>
                    <TextInput
                      style={[styles.inlineInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                      value={nameInput}
                      onChangeText={setNameInput}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textMuted}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={saveName}
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingName(false)}>
                      <Ionicons name="close" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editRow}
                    onPress={() => { setNameInput(displayName); setEditingName(true); }}
                  >
                    <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                      {displayName || 'Tap to set'}
                    </Text>
                    <Ionicons name="pencil-outline" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>

          {/* ── Shopping Defaults ────────────────────── */}
          <SectionLabel label="SHOPPING DEFAULTS" />
          <Card>
            {/* Default Budget */}
            <View style={styles.row}>
              <Ionicons name="wallet-outline" size={22} color="#10B981" />
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Default Budget</Text>
                {editingBudget ? (
                  <View style={styles.inlineEdit}>
                    <TextInput
                      style={[styles.inlineInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
                      value={budgetInput}
                      onChangeText={setBudgetInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={saveBudget}
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={saveBudget}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingBudget(false)}>
                      <Ionicons name="close" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editRow}
                    onPress={() => { setBudgetInput(defaultBudget); setEditingBudget(true); }}
                  >
                    <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                      {defaultBudget ? `$${parseFloat(defaultBudget).toFixed(2)}` : 'Tap to set'}
                    </Text>
                    <Ionicons name="pencil-outline" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Divider />

            {/* Preferred Store */}
            <View style={[styles.row, { alignItems: 'flex-start', paddingBottom: 4 }]}>
              <Ionicons name="storefront-outline" size={22} color="#10B981" style={{ marginTop: 2 }} />
              <View style={[styles.rowContent, { paddingBottom: 8 }]}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Preferred Store</Text>
                <View style={styles.storeOptions}>
                  {storeOptions.map((opt) => {
                    const selected = preferredStore === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.storeChip,
                          selected
                            ? styles.storeChipSelected
                            : { backgroundColor: colors.chipBackground, borderColor: colors.chipBorder },
                        ]}
                        onPress={() => selectStore(opt.value)}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={14}
                          color={selected ? 'white' : colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.storeChipText, { color: selected ? 'white' : colors.textSecondary }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </Card>

          {/* ── Shopping Stats ───────────────────────── */}
          <SectionLabel label="YOUR STATS" />
          {statsLoading ? (
            <ActivityIndicator color="#10B981" style={{ marginVertical: 24 }} />
          ) : !isPremium ? (
            /* ── Locked: real layout blurred + premium banner on top ── */
            <TouchableOpacity activeOpacity={0.9} onPress={() => setShowUpsell(true)}>
              <View style={styles.lockedWrapper}>
                <View style={styles.lockedPreview} pointerEvents="none">
                  {/* Row 1 */}
                  <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {[
                      { icon: 'receipt-outline',      label: 'Total Trips',  value: '24',      color: '#10B981' },
                      { icon: 'cash-outline',          label: 'Total Spent',  value: '$847.32', color: '#10B981' },
                      { icon: 'trending-down-outline', label: 'Avg / Trip',   value: '$35.30',  color: '#10B981' },
                    ].map((s, i, arr) => (
                      <React.Fragment key={s.label}>
                        <View style={styles.statItem}>
                          <Ionicons name={s.icon as any} size={22} color={s.color} style={styles.statIcon} />
                          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
                          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                        </View>
                        {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />}
                      </React.Fragment>
                    ))}
                  </View>
                  {/* Row 2 */}
                  <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                    {[
                      { icon: 'leaf-outline',       label: 'Total Saved',  value: '$112.68', color: '#10B981' },
                      { icon: 'pie-chart-outline',  label: 'Savings Rate', value: '13%',     color: '#10B981' },
                      { icon: 'storefront-outline', label: 'Top Store',    value: 'Walmart', color: '#4A90E2' },
                    ].map((s, i, arr) => (
                      <React.Fragment key={s.label}>
                        <View style={styles.statItem}>
                          <Ionicons name={s.icon as any} size={22} color={s.color} style={styles.statIcon} />
                          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
                          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                        </View>
                        {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />}
                      </React.Fragment>
                    ))}
                  </View>
                  {/* Budget Health ghost */}
                  <View style={[styles.budgetHealthCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                    <View style={styles.budgetHealthTop}>
                      <Text style={[styles.budgetHealthLabel, { color: colors.textSecondary }]}>Budget Health</Text>
                      <Text style={[styles.budgetHealthPct, { color: '#10B981' }]}>83%</Text>
                    </View>
                    <View style={[styles.budgetHealthBar, { backgroundColor: colors.inputBorder }]}>
                      <View style={[styles.budgetHealthFill, { width: '83%', backgroundColor: '#10B981' }]} />
                    </View>
                    <View style={styles.budgetHealthLegend}>
                      <Text style={[styles.budgetHealthSub, { color: colors.textMuted }]}>20 of 24 trips on budget</Text>
                      <Text style={[styles.budgetHealthSub, { color: '#EF4444' }]}>4 over budget</Text>
                    </View>
                  </View>
                  {/* Activity ghost */}
                  <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                    {[
                      { icon: 'calendar-outline', label: 'This Month',  value: '3',   color: '#4A90E2' },
                      { icon: 'list-outline',     label: 'Avg Items',   value: '8.2', color: '#4A90E2' },
                      { icon: 'scan-outline',     label: 'Total Items', value: '197', color: '#4A90E2' },
                    ].map((s, i, arr) => (
                      <React.Fragment key={s.label}>
                        <View style={styles.statItem}>
                          <Ionicons name={s.icon as any} size={22} color={s.color} style={styles.statIcon} />
                          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
                          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                        </View>
                        {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />}
                      </React.Fragment>
                    ))}
                  </View>
                  {/* Records ghost */}
                  <View style={[styles.recordsRow, { marginTop: 12 }]}>
                    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
                      <Text style={[styles.recordValue, { color: colors.textPrimary }]}>$48.12</Text>
                      <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Best Single Save</Text>
                    </View>
                    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <Ionicons name="flame-outline" size={20} color="#EF4444" />
                      <Text style={[styles.recordValue, { color: colors.textPrimary }]}>$94.67</Text>
                      <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Biggest Trip</Text>
                    </View>
                  </View>
                </View>

                {/* Frosted overlay */}
                <View style={styles.lockedOverlay}>
                  <View style={styles.lockedBanner}>
                    <Ionicons name="lock-closed" size={26} color="#F59E0B" />
                    <Text style={styles.lockedTitle}>Unlock Your Stats</Text>
                    <Text style={styles.lockedSubtext}>
                      Upgrade to Premium to see your real totals, savings rate, top store & more.
                    </Text>
                    <View style={styles.lockedBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.lockedBadgeText}>Premium Feature</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : totalTrips === 0 ? (
            <Card>
              <View style={styles.emptyStats}>
                <Ionicons name="bar-chart-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyStatsText, { color: colors.textSecondary }]}>
                  Complete your first shopping trip{'\n'}to see your stats here.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* ── Overview ── */}
              <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <StatItem icon="receipt-outline" label="Total Trips" value={String(totalTrips)} />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem icon="cash-outline" label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem icon="trending-down-outline" label="Avg / Trip" value={`$${avgSpent.toFixed(2)}`} />
              </View>

              {/* ── Savings ── */}
              <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                <StatItem icon="leaf-outline" label="Total Saved" value={`$${totalSaved.toFixed(2)}`} color="#10B981" />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem
                  icon="pie-chart-outline"
                  label="Savings Rate"
                  value={`${savingsRate.toFixed(0)}%`}
                  color={savingsRate >= 10 ? '#10B981' : '#F59E0B'}
                />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem icon="storefront-outline" label="Top Store" value={mostUsedStore} color="#4A90E2" />
              </View>

              {/* ── Budget Health ── */}
              <View style={[styles.budgetHealthCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                <View style={styles.budgetHealthTop}>
                  <Text style={[styles.budgetHealthLabel, { color: colors.textSecondary }]}>Budget Health</Text>
                  <Text style={[styles.budgetHealthPct, { color: onBudgetRate >= 70 ? '#10B981' : '#F59E0B' }]}>
                    {onBudgetRate.toFixed(0)}%
                  </Text>
                </View>
                <View style={[styles.budgetHealthBar, { backgroundColor: colors.inputBorder }]}>
                  <View style={[
                    styles.budgetHealthFill,
                    {
                      width: `${onBudgetRate}%` as any,
                      backgroundColor: onBudgetRate >= 70 ? '#10B981' : '#F59E0B',
                    },
                  ]} />
                </View>
                <View style={styles.budgetHealthLegend}>
                  <Text style={[styles.budgetHealthSub, { color: colors.textMuted }]}>
                    {onBudgetTrips} of {totalTrips} trips on budget
                  </Text>
                  <Text style={[styles.budgetHealthSub, { color: '#EF4444' }]}>
                    {totalTrips - onBudgetTrips} over budget
                  </Text>
                </View>
              </View>

              {/* ── Activity ── */}
              <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 12 }]}>
                <StatItem icon="calendar-outline" label="This Month" value={String(tripsThisMonth)} color="#4A90E2" />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem icon="list-outline" label="Avg Items" value={avgItems.toFixed(1)} color="#4A90E2" />
                <View style={[styles.statDivider, { backgroundColor: colors.settingItemBorder }]} />
                <StatItem icon="scan-outline" label="Total Items" value={String(totalItems)} color="#4A90E2" />
              </View>

              {/* ── Personal Records ── */}
              <View style={[styles.recordsRow, { marginTop: 12 }]}>
                <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
                  <Text style={[styles.recordValue, { color: colors.textPrimary }]}>${bestSaving.toFixed(2)}</Text>
                  <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Best Single Save</Text>
                </View>
                <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Ionicons name="flame-outline" size={22} color="#EF4444" />
                  <Text style={[styles.recordValue, { color: colors.textPrimary }]}>${biggestTrip.toFixed(2)}</Text>
                  <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Biggest Trip</Text>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      <PremiumUpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="all-time stats"
      />
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
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  avatarSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Inline edit
  inlineEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    padding: 4,
  },

  // Store chips
  storeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  storeChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  storeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: 14,
  },

  // Empty stats
  emptyStats: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  emptyStatsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Budget Health card
  budgetHealthCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHealthTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetHealthLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  budgetHealthPct: {
    fontSize: 20,
    fontWeight: '700',
  },
  budgetHealthBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetHealthFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetHealthLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetHealthSub: {
    fontSize: 12,
  },

  // Personal Records row
  recordsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recordCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  recordLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // Locked (premium) stats card
  lockedWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  lockedPreview: {
    opacity: 0.18,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lockedBanner: {
    alignItems: 'center',
    gap: 8,
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  lockedSubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    marginTop: 2,
  },
  lockedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
});

export default ProfileScreen;

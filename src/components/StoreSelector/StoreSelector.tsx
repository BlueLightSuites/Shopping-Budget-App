import { RootStackParamList, StoreId } from '@/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AdBanner } from '../AdBanner/AdBanner';
import { useAds } from '@/contexts/AdContext';
import { PremiumUpsellModal } from '../PremiumUpsellModal/PremiumUpsellModal';
import { useTheme } from '@/contexts/ThemeContext';

const ZIP_STORAGE_KEY = '@last_zip_code';

/**
 * Logo Credits:
 * Smith's Logo by Smith's: https://cdn.brandfetch.io/idRYbPBhEA/theme/dark/logo.svg
 * Walmart Logo by Walmart: https://www.walmart.com
 */

type StoreLocatorNavigationProp = StackNavigationProp<RootStackParamList, 'StoreSelector'>;
type StoreSelectorScreenRouteProp = RouteProp<RootStackParamList, 'StoreSelector'>;

const stores: { id: number; name: string; storeId: StoreId }[] = [
  { id: 1, name: "Smith's Food and Drug", storeId: 'kroger' },
  { id: 2, name: 'Walmart', storeId: 'walmart' },
];

const StoreSelector = () => {
  const route = useRoute<StoreSelectorScreenRouteProp>();
  const { budget, existingItems = [], visitedStores = [] } = route.params;
  const navigation = useNavigation<StoreLocatorNavigationProp>();
  const { isPremium } = useAds();
  const { colors } = useTheme();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);

  // Restore last used ZIP code
  useEffect(() => {
    AsyncStorage.getItem(ZIP_STORAGE_KEY).then((saved) => {
      if (saved) setZipCode(saved);
    });
  }, []);

  // Pre-select the user's preferred store from Profile
  useEffect(() => {
    AsyncStorage.getItem('@profile_preferred_store').then((saved) => {
      if (saved && saved !== 'none') {
        const match = stores.find((s) => s.storeId === saved);
        if (match) setSelectedStore(match.id);
      }
    });
  }, []);

  const handleStoreSelect = (storeId: number) => {
    const selectedStoreId = stores.find((s) => s.id === storeId)?.storeId;
    // Block free users from picking a second store in the same trip
    if (
      !isPremium &&
      visitedStores.length > 0 &&
      selectedStoreId &&
      !visitedStores.includes(selectedStoreId)
    ) {
      setShowUpsell(true);
      return;
    }
    setSelectedStore(storeId);
  };

  const handleConfirm = async () => {
    if (zipCode.trim().length < 5) {
      alert('Please enter a valid 5-digit ZIP code.');
      return;
    }
    const selected = stores.find((s) => s.id === selectedStore);
    if (!selected) {
      alert('Please select a store.');
      return;
    }
    await AsyncStorage.setItem(ZIP_STORAGE_KEY, zipCode.trim());
    console.log(`Selected Store: ${selected.storeId}, Zip Code: ${zipCode}`);
    (navigation as any).navigate('ShoppingTab', {
      screen: 'ScanView',
      params: {
        budget,
        zipCode: zipCode.trim(),
        store: selected.storeId,
        existingItems,
        visitedStores,
      },
    });
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Dark navy header */}
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="storefront-outline" size={30} color="white" />
          <Text style={styles.headerTitle}>Choose a Store</Text>
          <Text style={styles.headerSubtitle}>Select where you'll be shopping</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Light content area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Store grid */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>AVAILABLE STORES</Text>
        <View style={styles.storeGrid}>
          {stores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.storeCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                selectedStore === store.id && styles.storeCardSelected,
              ]}
              onPress={() => handleStoreSelect(store.id)}
              activeOpacity={0.85}
            >
              {selectedStore === store.id && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                </View>
              )}
              <View style={styles.logoContainer}>
                {store.id === 1 && (
                  <Image
                    source={require('@/Assets/Smith\'s_logo.png')}
                    style={styles.storeLogo}
                    resizeMode="contain"
                  />
                )}
                {store.id === 2 && (
                  <Image
                    source={require('@/Assets/Walmart_Logo_1.png')}
                    style={styles.storeLogo}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={[
                styles.storeName,
                { color: colors.textSecondary },
                selectedStore === store.id && styles.storeNameSelected,
              ]}>
                {store.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ad Banner */}
        <AdBanner size="medium" style={{ marginBottom: 20 }} />

        {/* Zip Code card — shown after store selection */}
        {selectedStore && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="location" size={20} color="#10B981" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Location Details</Text>
                <Text style={styles.cardSubtitle}>Find the best deals near you</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.sectionDivider }]} />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>ZIP CODE</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <Ionicons name="navigate-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.zipInput, { color: colors.textPrimary }]}
                placeholder="Enter your zip code"
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                maxLength={5}
                value={zipCode}
                onChangeText={setZipCode}
              />
              {zipCode.length === 5 && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
            </View>

            <Text style={styles.disclaimer}>
              Used to show local prices and availability
            </Text>
          </View>
        )}

        {/* CTA button */}
        {selectedStore && (
          <TouchableOpacity
            style={[styles.ctaButton, !zipCode.trim() && styles.ctaButtonDisabled]}
            onPress={handleConfirm}
            disabled={!zipCode.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={zipCode.trim() ? ['#10B981', '#059669'] : ['#CBD5E1', '#CBD5E1']}
              style={styles.ctaGradient}
            >
              {/* <Ionicons name="cart-outline" size={22} color="white" /> */}
              <Text style={styles.ctaText}>Start Shopping</Text>
              {/* <Ionicons name="arrow-forward" size={20} color="white" /> */}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>

    <PremiumUpsellModal
      visible={showUpsell}
      onClose={() => setShowUpsell(false)}
      feature="multi-store trips"
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    padding: 4,
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  storeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  storeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  storeCardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#10B981',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogo: {
    width: 75,
    height: 75,
  },
  storeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  storeNameSelected: {
    color: '#059669',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  zipInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  disclaimer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaButton: {
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
});

export default StoreSelector;

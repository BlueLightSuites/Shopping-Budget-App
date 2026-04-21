import { apiService } from '@/services/api';
import { RootStackParamList } from '@/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, SafeAreaView, StatusBar, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Logo Credits:
 * Smith's Logo by Smith's: https://cdn.brandfetch.io/idRYbPBhEA/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1668079342588
 * Walmart Logo by Walmart: https://www.walmart.com
 */

type StoreLocatorNavigationProp = StackNavigationProp<RootStackParamList, 'StoreSelector'>;
type StoreSelectorScreenRouteProp = RouteProp<RootStackParamList, 'StoreSelector'>;

const stores = [
  { id: 1, name: "Smith's Food and Drug" },
  { id: 2, name: 'Walmart' },
];

const StoreSelector = () => {
  const route = useRoute<StoreSelectorScreenRouteProp>();
  const { budget } = route.params;
  const navigation = useNavigation<StoreLocatorNavigationProp>();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState('');

  const handleStoreSelect = (storeId: number) => {
    setSelectedStore(storeId);
  };

  const handleConfirm = async () => {
    // const locationId = await apiService.getLocationIdByZip(zipCode);
    if (zipCode.trim()) {
      console.log(`Selected Store: ${selectedStore}, Zip Code: ${zipCode}`);
      navigation.navigate('ScanView', { budget: budget, zipCode });

    } else {
      alert('Please enter a valid zip code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Store</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>Choose your favorite store to get started shopping</Text>

          {/* Store Cards - Grid Layout */}
          <View style={styles.storeGrid}>
            {stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeCard,
                  selectedStore === store.id && styles.storeCardSelected,
                ]}
                onPress={() => handleStoreSelect(store.id)}
                activeOpacity={0.8}
              >
                {selectedStore === store.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
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

                <Text style={styles.storeName}>{store.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ad Banner Space - Top Position */}
          <View style={styles.adContainer}>
            {/* TODO: Integrate Google AdMob Banner Ad here */}
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>Ad Space</Text>
            </View>
          </View>

          {/* Zip Code Section */}
          {selectedStore && (
            <Animated.View style={styles.zipCodeContainer}>
              <View style={styles.zipCodeHeader}>
                <Ionicons name="location" size={24} color="#FF6B6B" />
                <View style={styles.zipCodeHeaderText}>
                  <Text style={styles.zipCodeTitle}>Location Details</Text>
                  <Text style={styles.zipCodeSubtitle}>Find the best deals near you</Text>
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.zipCodeLabel}>Zip Code</Text>
                <TextInput
                  style={styles.zipCodeInput}
                  placeholder="Enter zip code"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChangeText={setZipCode}
                />
                {zipCode && (
                  <View style={styles.zipCodeValidIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !zipCode.trim() && styles.confirmButtonDisabled
                ]} 
                onPress={handleConfirm}
                disabled={!zipCode.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Continue Shopping</Text>
                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 10 }} />
              </TouchableOpacity>

              <Text style={styles.disclaimer}>We use your zip code to show local prices and availability</Text>
            </Animated.View>
          )}

          {/* Bottom Ad Banner Space */}
          <View style={styles.adContainer}>
            {/* TODO: Integrate Google AdMob Banner Ad here (or leave empty if premium user) */}
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>Ad Space</Text>
            </View>
          </View>

          {/* Premium Badge - Remove ads CTA */}
          <View style={styles.premiumCTA}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.premiumCTAText}>Go Premium to remove ads</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFD700" />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  storeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  storeCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  storeCardSelected: {
    backgroundColor: 'white',
    borderColor: '#FF6B6B',
    borderWidth: 3,
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  selectedBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogo: {
    width: 80,
    height: 80,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  zipCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  zipCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  zipCodeHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  zipCodeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  zipCodeSubtitle: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
    position: 'relative',
  },
  zipCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  zipCodeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    paddingRight: 40,
    backgroundColor: '#F9F9F9',
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  zipCodeValidIcon: {
    position: 'absolute',
    right: 12,
    top: 40,
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  adContainer: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adPlaceholder: {
    height: 100,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  adPlaceholderText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  premiumCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumCTAText: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default StoreSelector;
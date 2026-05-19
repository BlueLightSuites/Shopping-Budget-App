import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '@/contexts/AdContext';
import Qonversion from '@qonversion/react-native-sdk';
import Constants from 'expo-constants';

interface PremiumUpsellModalProps {
  visible: boolean;
  onClose: () => void;
  /** The specific feature name that triggered the gate, e.g. "multi-store trips" */
  feature?: string;
}

const PREMIUM_FEATURES: { icon: string; text: string }[] = [
  { icon: 'storefront-outline', text: 'Multi-store trips (Walmart + Smith\'s)' },
  { icon: 'time-outline',       text: 'Unlimited trip history' },
  { icon: 'bar-chart-outline',  text: 'All-time savings analytics' },
  { icon: 'finger-print',       text: 'Biometric lock & security' },
  { icon: 'ban-outline',        text: 'Ad-free experience' },
];

/**
 * Initiates the in-app purchase flow via Qonversion.
 * Fetches the current offerings, purchases the first available product,
 * and checks whether the 'premium' entitlement is active.
 */
async function startPurchaseFlow(): Promise<boolean> {
  if (Constants.executionEnvironment === 'storeClient') {
    throw new Error('In-app purchases are not available in Expo Go. Please use a development build.');
  }

  const offerings = await Qonversion.getSharedInstance().offerings();
  const product = offerings?.main?.products[0];
  if (!product) throw new Error('No products available. Please try again later.');

  const entitlements = await Qonversion.getSharedInstance().purchaseProduct(product, undefined);
  return entitlements.get('premium')?.isActive ?? false;
}

export const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({
  visible,
  onClose,
  feature,
}) => {
  const { setPremium } = useAds();
  const [purchasing, setPurchasing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setPurchasing(true);
    setErrorMsg(null);
    try {
      const success = await startPurchaseFlow();
      if (success) {
        setPremium(true);
        onClose();
      }
    } catch (err: any) {
      // Purchase was cancelled or failed — do NOT unlock premium
      setErrorMsg(err?.message ?? 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    if (purchasing) return; // prevent dismiss while a purchase is in flight
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.headerTitle}>Go Premium</Text>
            <Text style={styles.headerSubtitle}>
              {feature
                ? `Unlock ${feature} and more`
                : 'Unlock the full Scrimpr experience'}
            </Text>
          </LinearGradient>

          {/* Features list */}
          <View style={styles.body}>
            <Text style={styles.featuresLabel}>PREMIUM INCLUDES</Text>

            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={18} color="#10B981" />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}

            {/* Error message */}
            {errorMsg && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Upgrade CTA */}
            <TouchableOpacity
              onPress={handleUpgrade}
              activeOpacity={0.85}
              disabled={purchasing}
              style={[styles.upgradeButton, purchasing && styles.upgradeButtonDisabled]}
            >
              <LinearGradient
                colors={purchasing ? ['#94A3B8', '#94A3B8'] : ['#F59E0B', '#D97706']}
                style={styles.upgradeGradient}
              >
                {purchasing ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.upgradeText}>Processing…</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="star" size={18} color="white" />
                    <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.dismissButton}
              disabled={purchasing}
            >
              <Text style={[styles.dismissText, purchasing && { opacity: 0.4 }]}>
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  starBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    textAlign: 'center',
  },
  body: {
    padding: 24,
    paddingBottom: 40,
  },
  featuresLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    flex: 1,
  },
  upgradeButton: {
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  dismissButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

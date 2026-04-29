import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBiometric } from '../contexts/BiometricContext';

export default function LockScreen() {
  const { authenticate } = useBiometric();
  const iconScale = useRef(new Animated.Value(1)).current;

  // Trigger auth automatically on mount
  useEffect(() => {
    triggerAuth();
  }, []);

  const triggerAuth = async () => {
    pulseIcon();
    await authenticate();
  };

  const pulseIcon = () => {
    Animated.sequence([
      Animated.timing(iconScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(iconScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5A8A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* App Icon Area */}
          <View style={styles.logoRow}>
            <Ionicons name="scan" size={40} color="white" />
            <Text style={styles.appName}>Price Scanner</Text>
          </View>

          <Text style={styles.subtitle}>Smart Shopping Made Easy</Text>

          {/* Lock Icon */}
          <Animated.View style={[styles.lockIconContainer, { transform: [{ scale: iconScale }] }]}>
            <Ionicons name="lock-closed" size={64} color="rgba(255,255,255,0.9)" />
          </Animated.View>

          <Text style={styles.lockedText}>App Locked</Text>
          <Text style={styles.instructionText}>
            Use Face ID, Touch ID, or your device passcode to unlock.
          </Text>

          {/* Unlock Button */}
          <TouchableOpacity style={styles.unlockButton} onPress={triggerAuth} activeOpacity={0.8}>
            <Ionicons name="finger-print" size={22} color="#4A90E2" />
            <Text style={styles.unlockButtonText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 60,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  lockedText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});

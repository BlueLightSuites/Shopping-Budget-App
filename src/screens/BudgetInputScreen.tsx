import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AdBanner } from '../components/AdBanner/AdBanner';

type BudgetInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BudgetInput'>;

export default function BudgetInputScreen() {
  const navigation = useNavigation<BudgetInputScreenNavigationProp>();
  const [budget, setBudget] = useState('100.00');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale.includes('en')) setCurrencySymbol('$');
    else if (locale.includes('eu')) setCurrencySymbol('€');
    else if (locale.includes('gb')) setCurrencySymbol('£');
  }, []);

  const handleBudgetChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts.length === 2 && parts[1].length > 2) return;
    setBudget(cleaned);
  };

  const handleStartShopping = async () => {
    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }
    navigation.navigate('StoreSelector', { budget: budgetAmount });
  };

  const handleQuickBudget = (amount: number) => {
    setBudget(amount.toFixed(2));
  };

  const isReady = parseFloat(budget) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Dark navy header */}
      <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="wallet-outline" size={30} color="white" />
          <Text style={styles.headerTitle}>Set Your Budget</Text>
          <Text style={styles.headerSubtitle}>How much do you want to spend?</Text>
        </View>
      </LinearGradient>

      {/* Light content area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Budget input card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ENTER AMOUNT</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.budgetInput}
                value={budget}
                onChangeText={handleBudgetChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#CBD5E1"
                autoFocus
                selectTextOnFocus
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Quick options */}
            <Text style={styles.quickLabel}>Quick Options</Text>
            <View style={styles.quickBudgetButtons}>
              {[50, 75, 100, 150, 200, 250].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickBudgetButton,
                    parseFloat(budget) === amount && styles.quickBudgetButtonActive,
                  ]}
                  onPress={() => handleQuickBudget(amount)}
                >
                  <Text
                    style={[
                      styles.quickBudgetText,
                      parseFloat(budget) === amount && styles.quickBudgetTextActive,
                    ]}
                  >
                    {currencySymbol}{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ad Banner */}
          <AdBanner size="medium" style={{ marginBottom: 20 }} />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.startButton, !isReady && styles.startButtonDisabled]}
            onPress={handleStartShopping}
            activeOpacity={0.85}
            disabled={!isReady}
          >
            <LinearGradient
              colors={isReady ? ['#10B981', '#059669'] : ['#CBD5E1', '#CBD5E1']}
              style={styles.buttonGradient}
            >
              <Ionicons name="storefront-outline" size={22} color="white" />
              <Text style={styles.buttonText}>Choose a Store</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
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
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 6,
  },
  budgetInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 120,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  quickBudgetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickBudgetButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickBudgetButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  quickBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  quickBudgetTextActive: {
    color: '#059669',
  },
  startButton: {
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  zipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#64748B',
    marginBottom: 8,
  },
  zipInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  zipHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});
